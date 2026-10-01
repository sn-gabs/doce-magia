// ===============================
// CONSULTAR ENCOMENDAS
// Doce Magia - Atendente
// ===============================

const storage = window.DoceMagiaStorage;
const campoPesquisa = document.getElementById("campoPesquisa");
const filtroStatus = document.getElementById("filtroStatus");
const btnPesquisar = document.getElementById("btnPesquisar");
const tabelaPedidos = document.getElementById("tabelaPedidos");

function exibirStatus(status) {
    const mapa = {
        Pending: "Pendente",
        InProgress: "Em Produção",
        Delivered: "Entregue"
    };

    return mapa[status] || status;
}

function renderPedidos() {
    const pedidos = storage.getEncomendas();
    const filtro = campoPesquisa.value.toLowerCase();
    const statusFiltro = filtroStatus ? filtroStatus.value : "todos";

    const filtrados = pedidos.filter((pedido) => {
        const texto = `${pedido.id} ${pedido.cliente} ${pedido.produto}`.toLowerCase();
        const atendeTexto = texto.includes(filtro);
        const atendeStatus = statusFiltro === "todos" || pedido.status === statusFiltro;
        return atendeTexto && atendeStatus;
    });

    tabelaPedidos.innerHTML = "";

    if (!filtrados.length) {
        tabelaPedidos.innerHTML = '<tr><td colspan="6">Nenhuma encomenda encontrada.</td></tr>';
        return;
    }

    filtrados.forEach((pedido) => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>#${pedido.id}</td>
            <td>${pedido.cliente}</td>
            <td>${pedido.retirada || "-"}</td>
            <td>${storage.formatCurrency(pedido.total)}</td>
            <td>
                <span class="status ${pedido.status === "Pending" ? "pendente" : pedido.status === "InProgress" ? "producao" : "entregue"}">
                    ${exibirStatus(pedido.status)}
                </span>
            </td>
            <td>
                <button class="visualizar" type="button">
                    <i class="fa-solid fa-eye"></i>
                    Visualizar
                </button>
                <button class="status-btn" type="button">Alterar Status</button>
                <button class="excluir" type="button">Excluir</button>
            </td>
        `;

        linha.querySelector(".visualizar").addEventListener("click", () => {
            alert(`Pedido: #${pedido.id}\nCliente: ${pedido.cliente}\nProduto: ${pedido.produto}\nQuantidade: ${pedido.quantidade}\nPagamento: ${pedido.pagamento}\nTotal: ${storage.formatCurrency(pedido.total)}\nStatus: ${exibirStatus(pedido.status)}`);
        });

        linha.querySelector(".status-btn").addEventListener("click", () => {
            const statusAtual = pedido.status;
            const novoStatus = statusAtual === "Pending" ? "InProgress" : statusAtual === "InProgress" ? "Delivered" : "Pending";
            const pedidosAtualizados = storage.getEncomendas().map((item) => (item.id === pedido.id ? { ...item, status: novoStatus } : item));
            storage.saveEncomendas(pedidosAtualizados);
            renderPedidos();
        });

        linha.querySelector(".excluir").addEventListener("click", () => {
            const confirmar = confirm("Deseja realmente excluir esta encomenda?");

            if (confirmar) {
                const pedidosAtualizados = storage.getEncomendas().filter((item) => item.id !== pedido.id);
                storage.saveEncomendas(pedidosAtualizados);
                renderPedidos();
            }
        });

        tabelaPedidos.appendChild(linha);
    });
}

campoPesquisa.addEventListener("input", renderPedidos);
btnPesquisar.addEventListener("click", renderPedidos);

if (filtroStatus) {
    filtroStatus.addEventListener("change", renderPedidos);
}

window.addEventListener("load", renderPedidos);
window.addEventListener("storage", renderPedidos);
window.addEventListener("focus", renderPedidos);