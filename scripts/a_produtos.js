// ==========================================
// PRODUTOS - DOCE MAGIA
// ==========================================

const storage = window.DoceMagiaStorage;
const campoPesquisa = document.getElementById("campoPesquisa");
const listaProdutos = document.getElementById("listaProdutos");

function iconePorCategoria(categoria) {
    const icones = {
        Bolos: "fa-cake-candles",
        Sobremesas: "fa-ice-cream",
        Tortas: "fa-bread-slice",
        Cupcakes: "fa-birthday-cake",
        Cookies: "fa-cookie",
        Doces: "fa-candy-cane"
    };

    return icones[categoria] || "fa-box-open";
}

function renderProdutos(filtro = "") {
    const produtos = storage.getProdutos();
    const termo = filtro.toLowerCase();
    const filtrados = produtos.filter((produto) => {
        const texto = `${produto.nome} ${produto.categoria} ${produto.preco}`.toLowerCase();
        return texto.includes(termo);
    });

    listaProdutos.innerHTML = "";

    if (!filtrados.length) {
        listaProdutos.innerHTML = "<p>Nenhum produto encontrado.</p>";
        return;
    }

    filtrados.forEach((produto) => {
        const card = document.createElement("div");
        card.className = "produto-card";
        card.innerHTML = `
            <div class="icone-produto">
                <i class="fa-solid ${iconePorCategoria(produto.categoria)}"></i>
            </div>
            <h3>${produto.nome}</h3>
            <p class="categoria">${produto.categoria}</p>
            <p class="preco">${storage.formatCurrency(produto.preco)}</p>
            <span class="status ${produto.estoque > 0 ? "disponivel" : "indisponivel"}">
                ${produto.estoque > 0 ? `Em estoque · ${produto.estoque} un.` : "Sem estoque"}
            </span>
            <button class="visualizar" type="button">
                <i class="fa-solid fa-eye"></i>
                Visualizar
            </button>
        `;

        card.querySelector(".visualizar").addEventListener("click", () => {
            alert(`Produto: ${produto.nome}\nCategoria: ${produto.categoria}\nPreço: ${storage.formatCurrency(produto.preco)}\nEstoque: ${produto.estoque}`);
        });

        listaProdutos.appendChild(card);
    });
}

campoPesquisa.addEventListener("input", () => {
    renderProdutos(campoPesquisa.value);
});

window.addEventListener("load", () => {
    renderProdutos();
});