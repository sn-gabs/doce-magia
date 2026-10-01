const storageProdutores = window.DoceMagiaStorage;

function mostrarMensagemProdutor(texto, tipo) {
    const mensagem = document.getElementById("mensagemProdutor");
    mensagem.textContent = texto;
    mensagem.className = `mensagem_atendente ${tipo}`;
}

function paraHex(bytes) {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function derivarSenha(senha) {
    if (!window.crypto?.subtle) {
        throw new Error("Este navegador não oferece armazenamento seguro de senha nesta página.");
    }

    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const chave = await window.crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(senha),
        "PBKDF2",
        false,
        ["deriveBits"]
    );
    const resultado = await window.crypto.subtle.deriveBits({
        name: "PBKDF2",
        salt,
        iterations: 120000,
        hash: "SHA-256"
    }, chave, 256);

    return {
        algoritmo: "PBKDF2-SHA-256",
        iteracoes: 120000,
        salt: paraHex(salt),
        hash: paraHex(new Uint8Array(resultado))
    };
}

async function cadastrarProdutor(event) {
    event.preventDefault();

    const formulario = document.getElementById("formProdutor");
    const botao = document.getElementById("btnSalvarProdutor");
    const nome = document.getElementById("nome").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    if (senha.length < 8) {
        mostrarMensagemProdutor("A senha deve ter pelo menos 8 caracteres.", "erro");
        return;
    }

    if (senha !== confirmarSenha) {
        mostrarMensagemProdutor("As senhas não coincidem.", "erro");
        return;
    }

    const produtores = storageProdutores.getProdutores();
    const cpfNormalizado = cpf.replace(/\D/g, "");
    const cpfExiste = produtores.some((produtor) => String(produtor.cpf || "").replace(/\D/g, "") === cpfNormalizado);
    const emailExiste = produtores.some((produtor) => (produtor.email || "").toLowerCase() === email);

    if (cpfExiste) {
        mostrarMensagemProdutor("Já existe um produtor cadastrado com este CPF.", "erro");
        return;
    }

    if (emailExiste) {
        mostrarMensagemProdutor("Já existe um produtor cadastrado com este e-mail.", "erro");
        return;
    }

    botao.disabled = true;
    botao.textContent = "Cadastrando...";

    try {
        const senhaHash = await derivarSenha(senha);
        produtores.push({
            id: `produtor-${Date.now()}`,
            nome,
            cpf,
            telefone,
            email,
            senhaHash
        });
        storageProdutores.saveProdutores(produtores);
        mostrarMensagemProdutor(`Produtor "${nome}" cadastrado com sucesso.`, "sucesso");
        formulario.reset();

        window.setTimeout(() => {
            window.location.href = "g_dashboard.html";
        }, 1000);
    } catch (erro) {
        console.error("Não foi possível cadastrar o produtor:", erro);
        mostrarMensagemProdutor(erro.message || "Não foi possível cadastrar o produtor.", "erro");
    } finally {
        botao.disabled = false;
        botao.innerHTML = '<i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Salvar produtor';
    }
}

document.getElementById("formProdutor")?.addEventListener("submit", cadastrarProdutor);