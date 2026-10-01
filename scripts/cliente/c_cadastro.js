const storageCadastroCliente = window.DoceMagiaStorage;
const formularioCadastroCliente = document.getElementById("formCadastroCliente");
const mensagemCadastroCliente = document.getElementById("mensagemCadastroCliente");

function exibirMensagemCadastroCliente(texto, tipo) {
    mensagemCadastroCliente.textContent = texto;
    mensagemCadastroCliente.className = `mensagem_cadastro_cliente ${tipo}`;
}

function salvarCadastroCliente(event) {
    event.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const clientes = storageCadastroCliente.getClientes();
    const cpfNormalizado = cpf.replace(/\D/g, "");

    if (clientes.some((cliente) => String(cliente.cpf || "").replace(/\D/g, "") === cpfNormalizado)) {
        exibirMensagemCadastroCliente("Já existe um cliente cadastrado com este CPF.", "erro");
        return;
    }

    if (clientes.some((cliente) => (cliente.email || "").toLowerCase() === email)) {
        exibirMensagemCadastroCliente("Já existe um cliente cadastrado com este e-mail.", "erro");
        return;
    }

    const botao = document.getElementById("btnSalvarCadastroCliente");
    botao.disabled = true;
    storageCadastroCliente.saveClientes([...clientes, {
        id: `cliente-${Date.now()}`,
        nome,
        cpf,
        telefone,
        email
    }]);

    exibirMensagemCadastroCliente(`Cadastro de "${nome}" realizado com sucesso.`, "sucesso");
    formularioCadastroCliente.reset();
    window.setTimeout(() => {
        window.location.href = "c_dashboard.html";
    }, 1000);
}

formularioCadastroCliente?.addEventListener("submit", salvarCadastroCliente);