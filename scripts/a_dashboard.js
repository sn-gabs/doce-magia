(function () {
    const storage = window.DoceMagiaStorage;
    const container = document.getElementById("resumoDashboard");

    if (!container) {
        return;
    }

    function renderDashboard() {
        const clientes = storage.getClientes();
        const produtos = storage.getProdutos();
        const encomendas = storage.getEncomendas();
        const vendas = storage.getVendas();
        const hoje = new Date().toLocaleDateString("pt-BR");

        const pendentes = encomendas.filter((pedido) => pedido.status === "Pending" || pedido.status === "Pendente").length;
        const concluídas = encomendas.filter((pedido) => pedido.status === "Delivered" || pedido.status === "Entregue").length;
        const vendasHoje = vendas.filter((venda) => venda.data === hoje);
        const receitaHoje = vendasHoje.reduce((soma, venda) => soma + Number(venda.total || 0), 0);

        container.innerHTML = `
            <section class="resumo-dashboard" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:1rem; width:90%; margin:2rem auto 0;">
                <div style="background:#fff; border-radius:14px; padding:1rem; box-shadow:0 6px 18px rgba(0,0,0,0.08);">
                    <h3 style="margin:0 0 0.4rem; color:#7b4a2b;">Clientes</h3>
                    <p style="font-size:1.3rem; font-weight:700; margin:0;">${clientes.length}</p>
                </div>
                <div style="background:#fff; border-radius:14px; padding:1rem; box-shadow:0 6px 18px rgba(0,0,0,0.08);">
                    <h3 style="margin:0 0 0.4rem; color:#7b4a2b;">Produtos</h3>
                    <p style="font-size:1.3rem; font-weight:700; margin:0;">${produtos.length}</p>
                </div>
                <div style="background:#fff; border-radius:14px; padding:1rem; box-shadow:0 6px 18px rgba(0,0,0,0.08);">
                    <h3 style="margin:0 0 0.4rem; color:#7b4a2b;">Pendentes</h3>
                    <p style="font-size:1.3rem; font-weight:700; margin:0;">${pendentes}</p>
                </div>
                <div style="background:#fff; border-radius:14px; padding:1rem; box-shadow:0 6px 18px rgba(0,0,0,0.08);">
                    <h3 style="margin:0 0 0.4rem; color:#7b4a2b;">Concluídas</h3>
                    <p style="font-size:1.3rem; font-weight:700; margin:0;">${concluídas}</p>
                </div>
                <div style="background:#fff; border-radius:14px; padding:1rem; box-shadow:0 6px 18px rgba(0,0,0,0.08);">
                    <h3 style="margin:0 0 0.4rem; color:#7b4a2b;">Vendas hoje</h3>
                    <p style="font-size:1.3rem; font-weight:700; margin:0;">${vendasHoje.length}</p>
                </div>
                <div style="background:#fff; border-radius:14px; padding:1rem; box-shadow:0 6px 18px rgba(0,0,0,0.08);">
                    <h3 style="margin:0 0 0.4rem; color:#7b4a2b;">Receita hoje</h3>
                    <p style="font-size:1.3rem; font-weight:700; margin:0;">${storage.formatCurrency(receitaHoje)}</p>
                </div>
            </section>
        `;
    }

    window.addEventListener("load", renderDashboard);
    window.addEventListener("storage", renderDashboard);
    window.addEventListener("focus", renderDashboard);
})();
