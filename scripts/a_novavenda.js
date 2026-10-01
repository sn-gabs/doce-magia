const storage = window.DoceMagiaStorage;
const catalogo = document.querySelector(".produtos");
const barraPesquisa = document.querySelector(".barra_pesquisa input");
const carrinho = [];
const itensCarrinho = document.querySelector(".itens_carrinho");
const subtotal = document.getElementById("subtotal");
const total = document.getElementById("total");
const popup = document.getElementById("popup");
const fecharPopup = document.getElementById("fecharPopup");
const finalizar = document.querySelector(".btn_finalizar");

function renderProdutos(filtro = "") {
    const produtos = storage.getProdutos();
    const termo = filtro.toLowerCase();
    const filtrados = produtos.filter((produto) => `${produto.nome} ${produto.categoria}`.toLowerCase().includes(termo));

    catalogo.innerHTML = "";

    if (!filtrados.length) {
        catalogo.innerHTML = "<div class='produto'><h3>Nenhum produto encontrado.</h3></div>";
        return;
    }

    filtrados.forEach((produto) => {
        const card = document.createElement("div");
        card.className = "produto";
        card.innerHTML = `
            <h3>${produto.nome}</h3>
            <p class="categoria">${produto.categoria}</p>
            <p class="preco">${storage.formatCurrency(produto.preco)}</p>
        `;
        card.addEventListener("click", () => {
            adicionarAoCarrinho(produto);
        });
        catalogo.appendChild(card);
    });
}

function adicionarAoCarrinho(produto) {
    const produtoNoCarrinho = carrinho.find((item) => item.id === produto.id);

    if (produtoNoCarrinho) {
        produtoNoCarrinho.quantidade += 1;
    } else {
        carrinho.push({ ...produto, quantidade: 1 });
    }

    renderizarCarrinho();
}

function renderizarCarrinho() {
    itensCarrinho.innerHTML = "";

    if (!carrinho.length) {
        itensCarrinho.innerHTML = "<p>Nenhum item adicionado.</p>";
        subtotal.textContent = storage.formatCurrency(0);
        total.textContent = storage.formatCurrency(0);
        return;
    }

    carrinho.forEach((item) => {
        const card = document.createElement("div");
        card.className = "item-carrinho";
        card.innerHTML = `
            <h4>${item.nome}</h4>
            <p>${item.categoria}</p>
            <p>${storage.formatCurrency(item.preco)}</p>
            <p>Quantidade: ${item.quantidade}</p>
        `;
        itensCarrinho.appendChild(card);
    });

    const soma = carrinho.reduce((acumulador, item) => acumulador + Number(item.preco) * item.quantidade, 0);
    subtotal.textContent = storage.formatCurrency(soma);
    total.textContent = storage.formatCurrency(soma);
}

function preencherClientesVenda() {
    const selectCliente = document.getElementById("clienteVenda");

    if (!selectCliente) {
        return;
    }

    selectCliente.innerHTML = '<option value="">Selecione um cliente</option>';

    storage.getClientes().forEach((cliente) => {
        const option = document.createElement("option");
        option.value = cliente.id;
        option.textContent = cliente.nome;
        selectCliente.appendChild(option);
    });
}

function criarResumoVenda() {
    const containerResumo = document.querySelector(".resumo");

    if (document.getElementById("clienteVenda")) {
        return;
    }

    const painel = document.createElement("div");
    painel.className = "painel-venda";
    painel.innerHTML = `
        <div class="linha">
            <div class="grupo">
                <label>Cliente</label>
                <select id="clienteVenda">
                    <option value="">Selecione um cliente</option>
                </select>
            </div>
            <div class="grupo">
                <label>Pagamento</label>
                <select id="pagamentoVenda">
                    <option value="Pix">Pix</option>
                    <option value="Cartão">Cartão</option>
                    <option value="Dinheiro">Dinheiro</option>
                </select>
            </div>
        </div>
    `;

    containerResumo.insertBefore(painel, containerResumo.querySelector(".btn_finalizar"));
    preencherClientesVenda();
}

finalizar.addEventListener("click", () => {
    const selectCliente = document.getElementById("clienteVenda");
    const selectPagamento = document.getElementById("pagamentoVenda");

    if (!carrinho.length) {
        alert("Adicione pelo menos um produto ao carrinho.");
        return;
    }

    if (!selectCliente || !selectCliente.value) {
        alert("Selecione um cliente para concluir a venda.");
        return;
    }

    const clienteSelecionado = storage.getClientes().find((cliente) => String(cliente.id) === String(selectCliente.value));
    const totalVenda = carrinho.reduce((acumulador, item) => acumulador + Number(item.preco) * item.quantidade, 0);
    const vendas = storage.getVendas();
    const novoId = vendas.length ? Math.max(...vendas.map((item) => Number(item.id) || 0)) + 1 : 1001;

    storage.saveVendas([
        ...vendas,
        {
            id: novoId,
            cliente: clienteSelecionado ? clienteSelecionado.nome : selectCliente.value,
            products: carrinho.map((item) => ({ nome: item.nome, quantidade: item.quantidade, preco: item.preco })),
            quantidade: carrinho.reduce((acumulador, item) => acumulador + item.quantidade, 0),
            pagamento: selectPagamento ? selectPagamento.value : "Pix",
            total: totalVenda,
            data: new Date().toLocaleDateString("pt-BR")
        }
    ]);

    carrinho.splice(0, carrinho.length);
    renderizarCarrinho();
    popup.style.display = "flex";
});

fecharPopup.addEventListener("click", () => {
    popup.style.display = "none";
});

barraPesquisa.addEventListener("input", () => {
    renderProdutos(barraPesquisa.value);
});

window.addEventListener("load", () => {
    criarResumoVenda();
    renderProdutos();
    renderizarCarrinho();
});