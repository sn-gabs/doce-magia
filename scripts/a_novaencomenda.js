// ==========================================
// NOVA ENCOMENDA - DOCE MAGIA
// ==========================================

const storage = window.DoceMagiaStorage;
const formulario = document.getElementById("formEncomenda");
const clienteSelect = document.getElementById("cliente");
const telefone = document.getElementById("telefone");
const produtoSelect = document.getElementById("produto");
const quantidade = document.getElementById("quantidade");
const pagamento = document.getElementById("pagamento");
const observacoes = document.getElementById("observacoes");
const retirada = document.getElementById("retirada");
const produtoResumo = document.getElementById("produtoResumo");
const quantidadeResumo = document.getElementById("quantidadeResumo");
const valorTotal = document.getElementById("valorTotal");

function preencherClientes() {
    const clientes = storage.getClientes();
    clienteSelect.innerHTML = '<option value="">Selecione um cliente</option>';

    clientes.forEach((cliente) => {
        const option = document.createElement("option");
        option.value = cliente.id;
        option.textContent = cliente.nome;
        clienteSelect.appendChild(option);
    });
}

function preencherProdutos() {
    const produtos = storage.getProdutos();
    produtoSelect.innerHTML = "";

    produtos.forEach((produto) => {
        const option = document.createElement("option");
        option.value = produto.id;
        option.textContent = `${produto.nome} - ${storage.formatCurrency(produto.preco)}`;
        produtoSelect.appendChild(option);
    });
}

function atualizarResumo() {
    const produtos = storage.getProdutos();
    const produtoSelecionado = produtos.find((item) => String(item.id) === String(produtoSelect.value)) || produtos[0];
    const nomeProduto = produtoSelecionado ? produtoSelecionado.nome : "Produto";
    const preco = produtoSelecionado ? Number(produtoSelecionado.preco) : 0;
    const qtd = Math.max(1, parseInt(quantidade.value, 10) || 1);
    const total = preco * qtd;

    produtoResumo.textContent = nomeProduto;
    quantidadeResumo.textContent = qtd;
    valorTotal.textContent = storage.formatCurrency(total);
}

clienteSelect.addEventListener("change", () => {
    const clientes = storage.getClientes();
    const clienteSelecionado = clientes.find((item) => String(item.id) === String(clienteSelect.value));
    telefone.value = clienteSelecionado ? clienteSelecionado.telefone : "";
});

produtoSelect.addEventListener("change", atualizarResumo);
quantidade.addEventListener("input", atualizarResumo);

formulario.addEventListener("submit", (event) => {
    event.preventDefault();

    const clienteSelecionado = storage.getClientes().find((item) => String(item.id) === String(clienteSelect.value));
    const nomeCliente = clienteSelecionado ? clienteSelecionado.nome : clienteSelect.value.trim();
    const telefoneCliente = telefone.value.trim();
    const dataRetirada = retirada.value;
    const produtoSelecionado = storage.getProdutos().find((item) => String(item.id) === String(produtoSelect.value));
    const qtd = Math.max(1, parseInt(quantidade.value, 10) || 1);
    const total = produtoSelecionado ? Number(produtoSelecionado.preco) * qtd : 0;

    if (!nomeCliente) {
        alert("Selecione um cliente.");
        return;
    }

    if (!telefoneCliente) {
        alert("Informe o telefone do cliente.");
        return;
    }

    if (!dataRetirada) {
        alert("Informe a data de retirada.");
        return;
    }

    if (!produtoSelecionado) {
        alert("Selecione um produto válido.");
        return;
    }

    const encomendas = storage.getEncomendas();
    const novoId = encomendas.length ? Math.max(...encomendas.map((item) => Number(item.id) || 0)) + 1 : 1001;

    const novaEncomenda = {
        id: novoId,
        cliente: nomeCliente,
        telefone: telefoneCliente,
        produto: produtoSelecionado.nome,
        quantidade: qtd,
        retirada: dataRetirada,
        pagamento: pagamento.value,
        observacoes: observacoes.value.trim(),
        total,
        status: "Pending"
    };

    storage.saveEncomendas([...encomendas, novaEncomenda]);
    alert("Encomenda cadastrada com sucesso!");

    formulario.reset();
    quantidade.value = 1;
    telefone.value = "";
    atualizarResumo();
});

window.addEventListener("load", () => {
    preencherClientes();
    preencherProdutos();
    atualizarResumo();
});