const storage = window.DoceMagiaStorage;
const modal = document.getElementById("modalCliente");
const formulario = document.getElementById("formCliente");
const campoPesquisa = document.getElementById("campoPesquisa");
const tabelaClientes = document.getElementById("tabelaClientes");
const mensagem = document.getElementById("mensagem");
let clienteEditandoId = null;

function escaparHtml(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function mostrarMensagem(texto, tipo) {
    if (!mensagem) return;

    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;
}

function abrirModal(cliente) {
    if (!modal || !formulario) return;

    clienteEditandoId = cliente.id;
    formulario.reset();
    document.getElementById("nome").value = cliente.nome || "";
    document.getElementById("cpf").value = cliente.cpf || "";
    document.getElementById("telefone").value = cliente.telefone || "";
    document.getElementById("email").value = cliente.email || "";
    document.querySelector("#modalCliente h2").textContent = "Editar Cliente";
    modal.classList.add("aberto");
    modal.setAttribute("aria-hidden", "false");
    document.getElementById("nome").focus();
}

function fecharModalCliente() {
    if (!modal) return;

    modal.classList.remove("aberto");
    modal.setAttribute("aria-hidden", "true");
    formulario?.reset();
    clienteEditandoId = null;
}

function renderClientes(filtro = "") {
    if (!tabelaClientes || !storage) return;

    const termo = filtro.trim().toLocaleLowerCase("pt-BR");
    const clientes = storage.getClientes();
    const filtrados = clientes.filter((cliente) => {
        const texto = `${cliente.nome} ${cliente.cpf} ${cliente.telefone} ${cliente.email}`.toLocaleLowerCase("pt-BR");
        return texto.includes(termo);
    });

    if (!filtrados.length) {
        tabelaClientes.innerHTML = '<tr><td colspan="5" class="sem_clientes">Nenhum cliente encontrado.</td></tr>';
        return;
    }

    tabelaClientes.innerHTML = filtrados.map((cliente) => `
        <tr>
            <td>${escaparHtml(cliente.nome)}</td>
            <td>${escaparHtml(cliente.cpf)}</td>
            <td>${escaparHtml(cliente.telefone)}</td>
            <td>${escaparHtml(cliente.email)}</td>
            <td class="acoes_cliente">
                <button class="editar" type="button" data-acao="editar" data-id="${escaparHtml(cliente.id)}" aria-label="Editar ${escaparHtml(cliente.nome)}" title="Editar cliente">
                    <i class="fa-solid fa-pen" aria-hidden="true"></i>
                </button>
                <button class="excluir" type="button" data-acao="excluir" data-id="${escaparHtml(cliente.id)}" aria-label="Excluir ${escaparHtml(cliente.nome)}" title="Excluir cliente">
                    <i class="fa-solid fa-trash" aria-hidden="true"></i>
                </button>
            </td>
        </tr>
    `).join("");
}

function salvarCliente(event) {
    event.preventDefault();

    if (!storage || !formulario) return;

    const cadastroPage = document.body.dataset.pagina === "cadastro";
    const parametros = new URLSearchParams(window.location.search);
    const idNaUrl = cadastroPage ? parametros.get("editar") : null;
    const idEdicao = clienteEditandoId || idNaUrl;
    const nome = document.getElementById("nome").value.trim();
    const cpf = document.getElementById("cpf").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const email = document.getElementById("email").value.trim();

    if (!nome || !cpf || !telefone || !email) {
        mostrarMensagem("Preencha todos os campos para salvar o cliente.", "erro");
        return;
    }

    const clientes = storage.getClientes();
    const cpfNormalizado = cpf.replace(/\D/g, "");
    const cpfDuplicado = clientes.some((cliente) => (
        String(cliente.cpf || "").replace(/\D/g, "") === cpfNormalizado && String(cliente.id) !== String(idEdicao)
    ));

    if (cpfDuplicado) {
        mostrarMensagem("Já existe um cliente cadastrado com este CPF.", "erro");
        return;
    }

    const dadosCliente = {
        id: idEdicao || `cliente-${Date.now()}`,
        nome,
        cpf,
        telefone,
        email
    };
    const clientesAtualizados = idEdicao
        ? clientes.map((cliente) => String(cliente.id) === String(idEdicao) ? dadosCliente : cliente)
        : [...clientes, dadosCliente];

    storage.saveClientes(clientesAtualizados);

    if (cadastroPage) {
        mostrarMensagem(idEdicao ? "Cliente atualizado com sucesso." : "Cliente cadastrado com sucesso.", "sucesso");
        formulario.reset();
        window.setTimeout(() => {
            window.location.href = "a_clientes.html";
        }, 900);
        return;
    }

    fecharModalCliente();
    renderClientes(campoPesquisa?.value || "");
    mostrarMensagem("Cliente atualizado com sucesso.", "sucesso");
}

function inicializarLista() {
    if (!tabelaClientes) return;

    renderClientes();
    campoPesquisa?.addEventListener("input", () => renderClientes(campoPesquisa.value));

    tabelaClientes.addEventListener("click", (event) => {
        const botao = event.target.closest("button[data-acao]");
        if (!botao) return;

        const cliente = storage.getClientes().find((item) => String(item.id) === botao.dataset.id);
        if (!cliente) return;

        if (botao.dataset.acao === "editar") {
            abrirModal(cliente);
        } else if (botao.dataset.acao === "excluir" && window.confirm(`Deseja excluir o cliente "${cliente.nome}"?`)) {
            storage.saveClientes(storage.getClientes().filter((item) => String(item.id) !== String(cliente.id)));
            renderClientes(campoPesquisa?.value || "");
            mostrarMensagem("Cliente excluído com sucesso.", "sucesso");
        }
    });

    modal?.querySelectorAll("[data-fechar-modal]").forEach((botao) => {
        botao.addEventListener("click", fecharModalCliente);
    });
    modal?.addEventListener("click", (event) => {
        if (event.target === modal) fecharModalCliente();
    });
}

function inicializarCadastro() {
    if (!formulario || document.body.dataset.pagina !== "cadastro" || !storage) return;

    const idEdicao = new URLSearchParams(window.location.search).get("editar");
    const cliente = idEdicao
        ? storage.getClientes().find((item) => String(item.id) === String(idEdicao))
        : null;

    if (cliente) {
        document.getElementById("nome").value = cliente.nome || "";
        document.getElementById("cpf").value = cliente.cpf || "";
        document.getElementById("telefone").value = cliente.telefone || "";
        document.getElementById("email").value = cliente.email || "";
        document.querySelector(".cabecalho h2").textContent = "Editar Cliente";
        document.getElementById("btnSalvarCliente").textContent = "Salvar alterações";
    }

    document.getElementById("nome").focus();
}

formulario?.addEventListener("submit", salvarCliente);
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal?.classList.contains("aberto")) fecharModalCliente();
});

if (!storage) {
    mostrarMensagem("Não foi possível acessar os dados locais de clientes.", "erro");
} else {
    inicializarLista();
    inicializarCadastro();
}