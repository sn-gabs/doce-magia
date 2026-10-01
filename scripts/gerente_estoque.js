const storageEstoque = window.DoceMagiaStorage;
const categoriasEstoque = ["Açúcares", "Chocolates", "Laticínios", "Farinhas", "Outros"];

function escaparHtmlEstoque(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function formatarQuantidade(valor) {
    return Number(valor || 0).toLocaleString("pt-BR", {
        maximumFractionDigits: 2
    });
}

function mostrarMensagemEstoque(texto, tipo = "sucesso") {
    const mensagem = document.getElementById("mensagemEstoque");
    if (!mensagem) return;

    mensagem.textContent = texto;
    mensagem.className = `mensagem_estoque ${tipo}`;

    window.setTimeout(() => {
        mensagem.className = "mensagem_estoque";
    }, 4000);
}

function getEstadoEstoque(ingrediente) {
    const quantidade = Number(ingrediente.quantidade) || 0;
    const minimo = Number(ingrediente.minimo) || 0;

    if (quantidade <= 0) return { texto: "Esgotado", classe: "urgente" };
    if (quantidade < minimo) return { texto: "Atenção", classe: "atencao" };
    return { texto: "Normal", classe: "normal" };
}

function getIngredientesFiltrados() {
    const pesquisa = document.getElementById("pesquisaEstoque");
    const filtroCategoria = document.getElementById("filtroCategoria");
    const termo = (pesquisa?.value || "").trim().toLocaleLowerCase("pt-BR");
    const categoria = filtroCategoria?.value || "";

    return storageEstoque.getIngredientes().filter((ingrediente) => {
        const correspondeNome = ingrediente.nome.toLocaleLowerCase("pt-BR").includes(termo);
        const correspondeCategoria = !categoria || ingrediente.categoria === categoria;
        return correspondeNome && correspondeCategoria;
    });
}

function renderIngredientes() {
    const tabela = document.getElementById("tabelaEstoque");
    const corpo = document.getElementById("corpoEstoque");
    const estado = document.getElementById("estadoEstoque");
    if (!tabela || !corpo || !storageEstoque) return;

    const ingredientes = getIngredientesFiltrados();
    tabela.hidden = false;
    estado.hidden = true;

    if (!ingredientes.length) {
        corpo.innerHTML = '<tr><td colspan="6" class="estoque_vazio">Nenhum ingrediente encontrado.</td></tr>';
        return;
    }

    corpo.innerHTML = ingredientes.map((ingrediente) => {
        const status = getEstadoEstoque(ingrediente);
        return `
            <tr>
                <td><strong>${escaparHtmlEstoque(ingrediente.nome)}</strong></td>
                <td>${escaparHtmlEstoque(ingrediente.categoria)}</td>
                <td class="quantidade_estoque">${formatarQuantidade(ingrediente.quantidade)} ${escaparHtmlEstoque(ingrediente.unidade)}</td>
                <td>${formatarQuantidade(ingrediente.minimo)} ${escaparHtmlEstoque(ingrediente.unidade)}</td>
                <td><span class="status_badge ${status.classe}">${status.texto}</span></td>
                <td class="acoes_tabela">
                    <button type="button" class="acao_estoque editar_estoque" data-acao="editar" data-id="${escaparHtmlEstoque(ingrediente.id)}" aria-label="Editar ${escaparHtmlEstoque(ingrediente.nome)}" title="Editar ingrediente">
                        <i class="fa-solid fa-pen" aria-hidden="true"></i>
                    </button>
                    <button type="button" class="acao_estoque repor_estoque" data-acao="repor" data-id="${escaparHtmlEstoque(ingrediente.id)}" aria-label="Repor ${escaparHtmlEstoque(ingrediente.nome)}" title="Repor estoque">
                        <i class="fa-solid fa-rotate" aria-hidden="true"></i>
                    </button>
                    <button type="button" class="acao_estoque excluir_estoque" data-acao="excluir" data-id="${escaparHtmlEstoque(ingrediente.id)}" aria-label="Excluir ${escaparHtmlEstoque(ingrediente.nome)}" title="Excluir ingrediente">
                        <i class="fa-solid fa-trash" aria-hidden="true"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

function preencherFiltroCategorias() {
    const filtro = document.getElementById("filtroCategoria");
    if (!filtro) return;

    categoriasEstoque.forEach((categoria) => {
        const opcao = document.createElement("option");
        opcao.value = categoria;
        opcao.textContent = categoria;
        filtro.appendChild(opcao);
    });
}

function fecharModalIngrediente() {
    const modal = document.getElementById("modalIngrediente");
    if (!modal) return;

    modal.classList.remove("aberto");
    modal.setAttribute("aria-hidden", "true");
    document.getElementById("formEdicaoIngrediente")?.reset();
}

function abrirEdicaoIngrediente(id) {
    const ingrediente = storageEstoque.getIngredientes().find((item) => String(item.id) === String(id));
    const modal = document.getElementById("modalIngrediente");
    if (!ingrediente || !modal) return;

    document.getElementById("editId").value = ingrediente.id;
    document.getElementById("editNome").value = ingrediente.nome;
    document.getElementById("editCategoria").value = ingrediente.categoria;
    document.getElementById("editQuantidade").value = ingrediente.quantidade;
    document.getElementById("editUnidade").value = ingrediente.unidade;
    document.getElementById("editMinimo").value = ingrediente.minimo;
    modal.classList.add("aberto");
    modal.setAttribute("aria-hidden", "false");
    document.getElementById("editNome").focus();
}

function lerDadosFormulario(prefixo = "") {
    const ids = prefixo
        ? {
            nome: `${prefixo}Nome`,
            categoria: `${prefixo}Categoria`,
            quantidade: `${prefixo}Quantidade`,
            unidade: `${prefixo}Unidade`,
            minimo: `${prefixo}Minimo`
        }
        : {
            nome: "nome",
            categoria: "categoria",
            quantidade: "quantidade",
            unidade: "unidade",
            minimo: "minimo"
        };

    return {
        nome: document.getElementById(ids.nome).value.trim(),
        categoria: document.getElementById(ids.categoria).value,
        quantidade: Number(document.getElementById(ids.quantidade).value),
        unidade: document.getElementById(ids.unidade).value,
        minimo: Number(document.getElementById(ids.minimo).value)
    };
}

function salvarEdicaoIngrediente(event) {
    event.preventDefault();

    const id = document.getElementById("editId").value;
    const dados = lerDadosFormulario("edit");
    const ingredientes = storageEstoque.getIngredientes();
    const atualizados = ingredientes.map((ingrediente) => (
        String(ingrediente.id) === String(id) ? { ...ingrediente, ...dados } : ingrediente
    ));

    storageEstoque.saveIngredientes(atualizados);
    fecharModalIngrediente();
    renderIngredientes();
    mostrarMensagemEstoque(`Ingrediente "${dados.nome}" atualizado com sucesso.`);
}

function cadastrarIngrediente(event) {
    event.preventDefault();

    const formulario = document.getElementById("formularioEstoque");
    const dados = lerDadosFormulario();
    const ingredientes = storageEstoque.getIngredientes();
    const duplicado = ingredientes.some((ingrediente) => (
        ingrediente.nome.toLocaleLowerCase("pt-BR") === dados.nome.toLocaleLowerCase("pt-BR")
        && ingrediente.categoria === dados.categoria
    ));

    if (duplicado) {
        mostrarMensagemEstoque("Esse ingrediente já está cadastrado nessa categoria.", "erro");
        return;
    }

    ingredientes.push({
        id: `ingrediente-${Date.now()}`,
        ...dados
    });
    storageEstoque.saveIngredientes(ingredientes);
    mostrarMensagemEstoque(`Ingrediente "${dados.nome}" cadastrado com sucesso.`);
    formulario.reset();

    window.setTimeout(() => {
        window.location.href = "g_estoque.html";
    }, 700);
}

function reporIngrediente(id) {
    const ingrediente = storageEstoque.getIngredientes().find((item) => String(item.id) === String(id));
    const modal = document.getElementById("modalReposicao");
    const formulario = document.getElementById("formReposicao");
    if (!ingrediente || !modal || !formulario) return;

    formulario.reset();
    document.getElementById("idIngredienteReposicao").value = ingrediente.id;
    document.getElementById("nomeIngredienteReposicao").textContent = `${ingrediente.nome} (${ingrediente.unidade})`;
    modal.classList.add("aberto");
    modal.setAttribute("aria-hidden", "false");
    document.getElementById("quantidadeReposicao").focus();
}

function fecharModalReposicao() {
    const modal = document.getElementById("modalReposicao");
    if (!modal) return;

    modal.classList.remove("aberto");
    modal.setAttribute("aria-hidden", "true");
    document.getElementById("formReposicao")?.reset();
}

function salvarReposicao(event) {
    event.preventDefault();

    const id = document.getElementById("idIngredienteReposicao").value;
    const quantidade = Number(document.getElementById("quantidadeReposicao").value);
    const ingredientes = storageEstoque.getIngredientes();
    const ingrediente = ingredientes.find((item) => String(item.id) === String(id));
    if (!ingrediente || !Number.isFinite(quantidade) || quantidade <= 0) return;

    ingrediente.quantidade = Number(ingrediente.quantidade) + quantidade;
    storageEstoque.saveIngredientes(ingredientes);
    fecharModalReposicao();
    renderIngredientes();
    mostrarMensagemEstoque(`Estoque de "${ingrediente.nome}" atualizado.`);
}

function excluirIngrediente(id) {
    const ingredientes = storageEstoque.getIngredientes();
    const ingrediente = ingredientes.find((item) => String(item.id) === String(id));
    if (!ingrediente || !window.confirm(`Deseja excluir "${ingrediente.nome}" do estoque?`)) return;

    storageEstoque.saveIngredientes(ingredientes.filter((item) => String(item.id) !== String(id)));
    renderIngredientes();
    mostrarMensagemEstoque(`Ingrediente "${ingrediente.nome}" excluído.`);
}

function inicializarEstoque() {
    const corpo = document.getElementById("corpoEstoque");
    if (!corpo) return;

    preencherFiltroCategorias();
    renderIngredientes();
    document.getElementById("pesquisaEstoque")?.addEventListener("input", renderIngredientes);
    document.getElementById("filtroCategoria")?.addEventListener("change", renderIngredientes);

    corpo.addEventListener("click", (event) => {
        const botao = event.target.closest("button[data-acao]");
        if (!botao) return;

        const id = botao.dataset.id;
        if (botao.dataset.acao === "editar") abrirEdicaoIngrediente(id);
        if (botao.dataset.acao === "repor") reporIngrediente(id);
        if (botao.dataset.acao === "excluir") excluirIngrediente(id);
    });

    const modal = document.getElementById("modalIngrediente");
    modal?.querySelectorAll("[data-fechar-modal]").forEach((botao) => {
        botao.addEventListener("click", fecharModalIngrediente);
    });
    modal?.addEventListener("click", (event) => {
        if (event.target === modal) fecharModalIngrediente();
    });
    document.getElementById("formEdicaoIngrediente")?.addEventListener("submit", salvarEdicaoIngrediente);

    const modalReposicao = document.getElementById("modalReposicao");
    modalReposicao?.querySelectorAll("[data-fechar-reposicao]").forEach((botao) => {
        botao.addEventListener("click", fecharModalReposicao);
    });
    modalReposicao?.addEventListener("click", (event) => {
        if (event.target === modalReposicao) fecharModalReposicao();
    });
    document.getElementById("formReposicao")?.addEventListener("submit", salvarReposicao);
}

function inicializarFormularioEstoque() {
    const formulario = document.getElementById("formularioEstoque");
    if (!formulario) return;

    formulario.addEventListener("submit", cadastrarIngrediente);
}

document.addEventListener("DOMContentLoaded", () => {
    if (!storageEstoque) {
        const estado = document.getElementById("estadoEstoque");
        if (estado) {
            estado.textContent = "Não foi possível acessar os dados do estoque.";
            estado.hidden = false;
        }
        return;
    }

    inicializarEstoque();
    inicializarFormularioEstoque();

    document.addEventListener("keydown", (event) => {
        const modal = document.getElementById("modalIngrediente");
        if (event.key === "Escape" && modal?.classList.contains("aberto")) {
            fecharModalIngrediente();
        }
        const modalReposicao = document.getElementById("modalReposicao");
        if (event.key === "Escape" && modalReposicao?.classList.contains("aberto")) {
            fecharModalReposicao();
        }
    });
});
