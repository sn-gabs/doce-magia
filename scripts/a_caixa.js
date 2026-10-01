// ==========================================
// CAIXA - DOCE MAGIA
// ==========================================

const storage = window.DoceMagiaStorage;
const formVenda = document.getElementById("formVenda");
const cliente = document.getElementById("cliente");
const pagamento = document.getElementById("pagamento");
const valor = document.getElementById("valor");
const faturamento = document.getElementById("faturamento");
const vendas = document.getElementById("vendas");
const pix = document.getElementById("pix");
const cartao = document.getElementById("cartao");
const dinheiro = document.getElementById("dinheiro");
const tabela = document.getElementById("tabelaVendas");

function atualizarCards() {
    const registros = storage.getVendas();
    const totalFaturamento = registros.reduce((soma, venda) => soma + Number(venda.total || 0), 0);
    const totalPix = registros.filter((venda) => venda.pagamento === "Pix").reduce((soma, venda) => soma + Number(venda.total || 0), 0);
    const totalCartao = registros.filter((venda) => venda.pagamento === "Cartão").reduce((soma, venda) => soma + Number(venda.total || 0), 0);
    const totalDinheiro = registros.filter((venda) => venda.pagamento === "Dinheiro").reduce((soma, venda) => soma + Number(venda.total || 0), 0);

    faturamento.textContent = storage.formatCurrency(totalFaturamento);
    vendas.textContent = registros.length;
    pix.textContent = storage.formatCurrency(totalPix);
    cartao.textContent = storage.formatCurrency(totalCartao);
    dinheiro.textContent = storage.formatCurrency(totalDinheiro);
}

function atualizarResumoCaixa() {
    atualizarCards();
    renderizarHistorico();
}

function renderizarHistorico() {
    const registros = storage.getVendas().slice().reverse();
    tabela.innerHTML = "";

    if (!registros.length) {
        tabela.innerHTML = '<tr><td colspan="3">Nenhuma venda registrada.</td></tr>';
        return;
    }

    registros.forEach((venda) => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${venda.cliente}</td>
            <td>${venda.pagamento}</td>
            <td>${storage.formatCurrency(venda.total)}</td>
        `;
        tabela.appendChild(linha);
    });
}

formVenda.addEventListener("submit", (event) => {
    event.preventDefault();

    const nomeCliente = cliente.value.trim();
    const formaPagamento = pagamento.value;
    const valorVenda = parseFloat(valor.value);

    if (!nomeCliente) {
        alert("Informe o nome do cliente.");
        return;
    }

    if (Number.isNaN(valorVenda) || valorVenda <= 0) {
        alert("Informe um valor válido.");
        return;
    }

    const vendasAtualizadas = storage.getVendas();
    const novoId = vendasAtualizadas.length ? Math.max(...vendasAtualizadas.map((item) => Number(item.id) || 0)) + 1 : 1001;

    storage.saveVendas([
        ...vendasAtualizadas,
        {
            id: novoId,
            cliente: nomeCliente,
            products: [],
            quantidade: 1,
            pagamento: formaPagamento,
            total: valorVenda,
            data: new Date().toLocaleDateString("pt-BR")
        }
    ]);

    atualizarCards();
    renderizarHistorico();
    formVenda.reset();
    cliente.focus();
    alert("Venda registrada com sucesso!");
});

window.addEventListener("load", atualizarResumoCaixa);
window.addEventListener("storage", atualizarResumoCaixa);
window.addEventListener("focus", atualizarResumoCaixa);