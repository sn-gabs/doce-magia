const modal = document.getElementById("modalDados");
const abrir = document.getElementById("abrirModal");
const fechar = document.getElementById("fecharModal");

abrir.onclick = function () {
    modal.classList.add("ativo");
}

fechar.onclick = function () {
    modal.classList.remove("ativo");
}

modal.onclick = function (evento) {
    if (evento.target == modal) {
        modal.classList.remove("ativo");
    }
}
