const storageAtendentes = window.DoceMagiaStorage;

function mostrarMensagemAtendente(texto, tipo) {
    const mensagem = document.getElementById("mensagemAtendente");
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

function normalizarCpf(cpf) {
    return cpf.replace(/\D/g, "");
}

async function cadastrarAtendente(event) {
    event.preventDefault();

    const formulario = document.getElementById("formAtendente");
    const botao = document.getElementById("btnSalvarAtendente");
    const nome = document.getElementById("nome").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const senha = document.getElementById("senha").value;
    const confirmarSenha = document.getElementById("confirmarSenha").value;

    if (senha.length < 8) {
        mostrarMensagemAtendente("A senha deve ter pelo menos 8 caracteres.", "erro");
        return;
    }

    if (senha !== confirmarSenha) {
        mostrarMensagemAtendente("As senhas não coincidem.", "erro");
        return;
    }

    const atendentes = storageAtendentes.getAtendentes();
    const cpfNormalizado = normalizarCpf(cpf);
    const cpfExiste = atendentes.some((atendente) => normalizarCpf(atendente.cpf || "") === cpfNormalizado);
    const emailExiste = atendentes.some((atendente) => (atendente.email || "").toLowerCase() === email);

    if (cpfExiste) {
        mostrarMensagemAtendente("Já existe um atendente cadastrado com este CPF.", "erro");
        return;
    }

    if (emailExiste) {
        mostrarMensagemAtendente("Já existe um atendente cadastrado com este e-mail.", "erro");
        return;
    }

    botao.disabled = true;
    botao.textContent = "Cadastrando...";

    try {
        const hashSenha = await derivarSenha(senha);
        atendentes.push({
            id: `atendente-${Date.now()}`,
            nome,
            cpf,
            telefone,
            email,
            senhaHash: hashSenha
        });
        storageAtendentes.saveAtendentes(atendentes);
        mostrarMensagemAtendente(`Atendente "${nome}" cadastrado com sucesso.`, "sucesso");
        formulario.reset();

        window.setTimeout(() => {
            window.location.href = "g_dashboard.html";
        }, 1000);
    } catch (erro) {
        console.error("Não foi possível cadastrar o atendente:", erro);
        mostrarMensagemAtendente(erro.message || "Não foi possível cadastrar o atendente.", "erro");
    } finally {
        botao.disabled = false;
        botao.innerHTML = '<i class="fa-solid fa-floppy-disk" aria-hidden="true"></i> Salvar atendente';
    }
}

document.getElementById("formAtendente")?.addEventListener("submit", cadastrarAtendente);
