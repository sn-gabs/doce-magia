const API_URL = 'http://10.124.75.2:8080/api/v1';

const escapeHtml = (value) => {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

function mostrarMensagem(texto, tipo = 'sucesso') {
    const mensagem = document.getElementById('mensagem');

    if (!mensagem) return;

    mensagem.textContent = texto;
    mensagem.className = `mensagem ${tipo}`;

    if (tipo !== 'erro') {
        setTimeout(() => {
            mensagem.className = 'mensagem';
        }, 5000);
    }
}

function getCategoriaNome(produto) {
    const categoria = produto?.categoria;

    if (!categoria) return 'Sem categoria';

    if (typeof categoria === 'string') return categoria;
    if (categoria.nome) return categoria.nome;
    if (categoria.descricao) return categoria.descricao;

    return 'Sem categoria';
}

function formatarPreco(preco) {
    const valor = Number(preco);

    if (!Number.isFinite(valor)) return 'R$ 0,00';

    return valor.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });
}

async function carregarCategorias() {
    const selectCategoria = document.getElementById('categoriaId');
    const selectCategoriaEdicao = document.getElementById('editCategoriaId');
    const selectFiltro = document.querySelector('.select_filtro');

    if (!selectCategoria && !selectCategoriaEdicao && !selectFiltro) return;

    try {
        const resposta = await fetch(`${API_URL}/categorias/ativas`);

        if (!resposta.ok) {
            throw new Error(`HTTP ${resposta.status}`);
        }

        const categorias = await resposta.json();

        [selectCategoria, selectCategoriaEdicao].forEach((select) => {
            if (!select) return;

            select.innerHTML = '<option value="">Selecione uma categoria</option>';
            categorias.forEach((categoria) => {
                const option = document.createElement('option');
                option.value = categoria.id;
                option.textContent = `${categoria.icone || '📦'} ${categoria.nome}`;
                select.appendChild(option);
            });
        });

        if (selectFiltro) {
            selectFiltro.innerHTML = '<option value="">Todas as categorias</option>';

            categorias.forEach((categoria) => {
                const option = document.createElement('option');
                option.value = categoria.nome;
                option.textContent = categoria.nome;
                selectFiltro.appendChild(option);
            });
        }
    } catch (erro) {
        console.error('Erro ao carregar categorias:', erro);

        if (selectCategoria) {
            selectCategoria.innerHTML = '<option value="">Erro ao carregar categorias</option>';
        }

        if (selectCategoriaEdicao) {
            selectCategoriaEdicao.innerHTML = '<option value="">Erro ao carregar categorias</option>';
        }

        if (selectFiltro) {
            selectFiltro.innerHTML = '<option value="">Todas as categorias</option>';
        }

        mostrarMensagem('Erro ao carregar categorias. Verifique se o back-end está online.', 'erro');
    }
}

function limparFormulario() {
    const form = document.getElementById('formProduto');

    if (!form) return;

    form.reset();
    const disponivel = document.getElementById('disponivel');
    const destaque = document.getElementById('destaque');

    if (disponivel) disponivel.checked = true;
    if (destaque) destaque.checked = false;

    const nome = document.getElementById('nome');
    if (nome) nome.focus();
}

async function inicializarFormulario() {
    const form = document.getElementById('formProduto');

    if (!form) return;

    const btnEnviar = document.getElementById('btnEnviar');
    const selectCategoria = document.getElementById('categoriaId');
    const tituloPagina = document.querySelector('.cabecalho_pagina h1');
    const params = new URLSearchParams(window.location.search);
    const produtoEditando = params.get('editar');

    await carregarCategorias();

    if (produtoEditando && tituloPagina) {
        try {
            const produto = JSON.parse(decodeURIComponent(produtoEditando));
            tituloPagina.textContent = 'Editar Produto';
            btnEnviar.textContent = 'Salvar Alterações';

            document.getElementById('nome').value = produto.nome || '';
            document.getElementById('descricao').value = produto.descricao || '';
            document.getElementById('preco').value = produto.preco || '';
            document.getElementById('tempoPreparo').value = produto.tempoPreparo || '';
            document.getElementById('ingredientes').value = produto.ingredientes || '';
            document.getElementById('peso').value = produto.peso || '';
            document.getElementById('imagem').value = produto.imagem || '';
            document.getElementById('destaque').checked = !!produto.destaque;
            document.getElementById('disponivel').checked = produto.disponivel !== false;

            if (selectCategoria && produto.categoriaId) {
                selectCategoria.value = String(produto.categoriaId);
            }

            form.dataset.produtoId = produto.id;
        } catch (erro) {
            console.error('Erro ao carregar produto para edição:', erro);
        }
    }

    form.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        if (!btnEnviar) return;

        btnEnviar.disabled = true;
        btnEnviar.textContent = form.dataset.produtoId ? 'Salvando...' : 'Cadastrando...';

        try {
            const dados = {
                nome: document.getElementById('nome')?.value.trim(),
                descricao: document.getElementById('descricao')?.value.trim() || null,
                preco: Number(document.getElementById('preco')?.value),
                tempoPreparo: Number(document.getElementById('tempoPreparo')?.value || document.getElementById('tempo')?.value),
                categoriaId: Number(selectCategoria?.value),
                ingredientes: document.getElementById('ingredientes')?.value.trim() || null,
                peso: document.getElementById('peso')?.value.trim() || null,
                imagem: document.getElementById('imagem')?.value.trim() || null,
                destaque: document.getElementById('destaque')?.checked || false,
                disponivel: document.getElementById('disponivel')?.checked ?? true
            };

            if (!dados.nome) throw new Error('O nome do produto é obrigatório.');
            if (!dados.preco || dados.preco <= 0) throw new Error('O preço deve ser maior que zero.');
            if (!dados.tempoPreparo || dados.tempoPreparo <= 0) throw new Error('O tempo de preparo deve ser maior que zero.');
            if (!dados.categoriaId) throw new Error('Selecione uma categoria.');

            const metodo = form.dataset.produtoId ? 'PUT' : 'POST';
            const url = form.dataset.produtoId ? `${API_URL}/produtos/${form.dataset.produtoId}` : `${API_URL}/produtos`;

            const resposta = await fetch(url, {
                method: metodo,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dados)
            });

            if (!resposta.ok) {
                let mensagemErro = `Erro HTTP ${resposta.status}`;

                try {
                    const erroData = await resposta.json();
                    mensagemErro = erroData.message || erroData.error || Object.values(erroData.errors || {}).join(', ') || mensagemErro;
                } catch (_) {
                    // ignora payload sem JSON
                }

                throw new Error(mensagemErro);
            }

            const produtoSalvo = await resposta.json();
            mostrarMensagem(
                form.dataset.produtoId
                    ? `✅ Produto "${produtoSalvo.nome || dados.nome}" atualizado com sucesso!`
                    : `✅ Produto "${produtoSalvo.nome || dados.nome}" cadastrado com sucesso!`,
                'sucesso'
            );

            limparFormulario();

            setTimeout(() => {
                window.location.href = 'g_produtos.html';
            }, 1200);
        } catch (erro) {
            console.error('Erro ao salvar produto:', erro);
            mostrarMensagem(`❌ ${erro.message}`, 'erro');
        } finally {
            btnEnviar.disabled = false;
            btnEnviar.textContent = form.dataset.produtoId ? 'Salvar Alterações' : 'Salvar Produto';
        }
    });
}

let produtosCache = [];

function getProdutosFiltrados() {
    const buscaInput = document.querySelector('.input_pesquisa');
    const filtroCategoria = document.querySelector('.select_filtro');
    const termoBusca = (buscaInput?.value || '').trim().toLowerCase();
    const categoriaSelecionada = filtroCategoria?.value || '';

    return produtosCache.filter((produto) => {
        const categoriaNome = getCategoriaNome(produto).toLowerCase();
        const nomeProduto = (produto.nome || '').toLowerCase();
        const descricaoProduto = (produto.descricao || '').toLowerCase();

        const atendeBusca = !termoBusca || nomeProduto.includes(termoBusca) || descricaoProduto.includes(termoBusca);
        const atendeCategoria = !categoriaSelecionada || categoriaNome === categoriaSelecionada.toLowerCase();

        return atendeBusca && atendeCategoria;
    });
}

function renderProdutos() {
    const listaProdutos = document.getElementById('listaProdutos');

    if (!listaProdutos) return;

    const tabela = document.getElementById('tabelaProdutos');
    const produtos = getProdutosFiltrados();
    const loading = document.getElementById('loadingProdutos');

    if (!produtos.length) {
        listaProdutos.innerHTML = '<tr><td colspan="8" class="celula_vazia">Nenhum produto encontrado.</td></tr>';
        if (tabela) tabela.hidden = false;
        if (loading) loading.hidden = true;
        return;
    }

    listaProdutos.innerHTML = produtos.map((produto) => {
        const categoria = getCategoriaNome(produto);
        const tempoPreparo = produto.tempoPreparo ?? produto.tempo_preparo ?? produto.tempo ?? '—';
        const disponivel = produto.disponivel !== false;
        const destaque = produto.destaque === true;
        const categoriaIcone = typeof produto.categoria === 'object' ? produto.categoria?.icone : '';
        const preco = produto.precoPromocional ?? produto.preco_promocional ?? produto.preco;

        return `
            <tr>
                <td>${escapeHtml(produto.id)}</td>
                <td><strong>${escapeHtml(produto.nome || 'Produto sem nome')}</strong></td>
                <td>${formatarPreco(preco)}</td>
                <td>${escapeHtml(tempoPreparo)} h</td>
                <td>${escapeHtml(categoriaIcone ? `${categoriaIcone} ${categoria}` : categoria)}</td>
                <td><span class="status_produto ${destaque ? 'sim' : 'nao'}">${destaque ? 'Sim' : 'Não'}</span></td>
                <td><span class="status_produto ${disponivel ? 'sim' : 'nao'}">${disponivel ? 'Sim' : 'Não'}</span></td>
                <td>
                    <div class="acoes_tabela">
                        <button type="button" class="btn_editar" data-acao="editar" data-id="${escapeHtml(produto.id)}" aria-label="Editar ${escapeHtml(produto.nome || 'produto')}" title="Editar produto">
                            <i class="fa-solid fa-pen" aria-hidden="true"></i>
                        </button>
                        <button type="button" class="btn_excluir" data-acao="excluir" data-id="${escapeHtml(produto.id)}" aria-label="Excluir ${escapeHtml(produto.nome || 'produto')}" title="Excluir produto">
                            <i class="fa-solid fa-trash" aria-hidden="true"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    if (tabela) tabela.hidden = false;
    if (loading) loading.hidden = true;
}

function fecharModalEdicao() {
    const modal = document.getElementById('modalEdicao');
    const form = document.getElementById('formEdicao');

    if (!modal) return;

    modal.classList.remove('aberto');
    modal.setAttribute('aria-hidden', 'true');
    form?.reset();
}

async function abrirEdicao(id) {
    const modal = document.getElementById('modalEdicao');
    if (!modal) return;

    try {
        await carregarCategorias();
        const resposta = await fetch(`${API_URL}/produtos/${id}`);
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

        const produto = await resposta.json();
        document.getElementById('editId').value = produto.id;
        document.getElementById('editNome').value = produto.nome || '';
        document.getElementById('editDescricao').value = produto.descricao || '';
        document.getElementById('editPreco').value = produto.preco ?? '';
        document.getElementById('editPrecoPromocional').value = produto.precoPromocional ?? produto.preco_promocional ?? '';
        document.getElementById('editTempoPreparo').value = produto.tempoPreparo ?? produto.tempo_preparo ?? produto.tempo ?? '';
        document.getElementById('editCategoriaId').value = produto.categoria?.id ?? produto.categoriaId ?? '';
        document.getElementById('editIngredientes').value = produto.ingredientes || '';
        document.getElementById('editPeso').value = produto.peso || '';
        document.getElementById('editImagem').value = produto.imagem || '';
        document.getElementById('editDestaque').checked = produto.destaque === true;
        document.getElementById('editDisponivel').checked = produto.disponivel !== false;

        modal.classList.add('aberto');
        modal.setAttribute('aria-hidden', 'false');
        document.getElementById('editNome').focus();
    } catch (erro) {
        console.error('Erro ao carregar produto para edição:', erro);
        mostrarMensagem(`Não foi possível carregar o produto: ${erro.message}`, 'erro');
    }
}

async function salvarEdicao(evento) {
    evento.preventDefault();

    const botaoSalvar = document.getElementById('btnSalvarEdicao');
    const id = document.getElementById('editId').value;
    const preco = Number(document.getElementById('editPreco').value);
    const valorPromocional = document.getElementById('editPrecoPromocional').value;
    const precoPromocional = valorPromocional ? Number(valorPromocional) : null;

    if (precoPromocional !== null && precoPromocional >= preco) {
        mostrarMensagem('O preço promocional deve ser menor que o preço normal.', 'erro');
        return;
    }

    const dados = {
        nome: document.getElementById('editNome').value.trim(),
        descricao: document.getElementById('editDescricao').value.trim() || null,
        preco,
        precoPromocional,
        tempoPreparo: Number(document.getElementById('editTempoPreparo').value),
        categoriaId: Number(document.getElementById('editCategoriaId').value),
        ingredientes: document.getElementById('editIngredientes').value.trim() || null,
        peso: document.getElementById('editPeso').value.trim() || null,
        imagem: document.getElementById('editImagem').value.trim() || null,
        destaque: document.getElementById('editDestaque').checked,
        disponivel: document.getElementById('editDisponivel').checked
    };

    botaoSalvar.disabled = true;
    botaoSalvar.textContent = 'Salvando...';

    try {
        const resposta = await fetch(`${API_URL}/produtos/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (!resposta.ok) {
            let mensagemErro = `Erro HTTP ${resposta.status}`;
            try {
                const erro = await resposta.json();
                mensagemErro = erro.message || mensagemErro;
            } catch (_) {
                // Resposta sem corpo JSON.
            }
            throw new Error(mensagemErro);
        }

        fecharModalEdicao();
        await buscarProdutos();
        mostrarMensagem(`Produto "${dados.nome}" atualizado com sucesso.`, 'sucesso');
    } catch (erro) {
        console.error('Erro ao salvar produto:', erro);
        mostrarMensagem(`Não foi possível salvar: ${erro.message}`, 'erro');
    } finally {
        botaoSalvar.disabled = false;
        botaoSalvar.textContent = 'Salvar alterações';
    }
}

async function excluirProduto(id) {
    const produto = produtosCache.find((item) => String(item.id) === String(id));
    const nome = produto?.nome || 'este produto';
    if (!window.confirm(`Deseja excluir "${nome}"?`)) return;

    try {
        const resposta = await fetch(`${API_URL}/produtos/${id}`, { method: 'DELETE' });
        if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);

        produtosCache = produtosCache.filter((item) => String(item.id) !== String(id));
        renderProdutos();
        mostrarMensagem(`Produto "${nome}" excluído com sucesso.`, 'sucesso');
    } catch (erro) {
        console.error('Erro ao excluir produto:', erro);
        mostrarMensagem(`Não foi possível excluir o produto: ${erro.message}`, 'erro');
    }
}

async function buscarProdutos() {
    const listaProdutos = document.getElementById('listaProdutos');

    if (!listaProdutos) return;

    const tabela = document.getElementById('tabelaProdutos');
    const loading = document.getElementById('loadingProdutos');

    try {
        if (loading) {
            loading.hidden = false;
            loading.textContent = 'Carregando produtos...';
        }
        if (tabela) tabela.hidden = true;

        const resposta = await fetch(`${API_URL}/produtos`);

        if (!resposta.ok) {
            throw new Error(`HTTP ${resposta.status}`);
        }

        const dados = await resposta.json();
        const produtos = Array.isArray(dados) ? dados : (dados.content || dados.itens || dados.data || []);

        produtosCache = Array.isArray(produtos) ? produtos : [];
        renderProdutos();
    } catch (erro) {
        console.error('Erro ao carregar produtos:', erro);
        if (loading) {
            loading.hidden = false;
            loading.textContent = 'Não foi possível carregar os produtos.';
        }
        mostrarMensagem('Erro ao carregar produtos. Verifique se o back-end está online.', 'erro');
    }
}

function inicializarListaProdutos() {
    const listaProdutos = document.getElementById('listaProdutos');
    const buscaInput = document.querySelector('.input_pesquisa');
    const filtroCategoria = document.querySelector('.select_filtro');

    if (!listaProdutos) return;

    if (buscaInput) {
        buscaInput.addEventListener('input', renderProdutos);
    }

    if (filtroCategoria) {
        filtroCategoria.addEventListener('change', renderProdutos);
    }

    listaProdutos.addEventListener('click', (evento) => {
        const botao = evento.target.closest('button[data-acao]');
        if (!botao) return;

        if (botao.dataset.acao === 'editar') {
            abrirEdicao(botao.dataset.id);
        } else if (botao.dataset.acao === 'excluir') {
            excluirProduto(botao.dataset.id);
        }
    });

    const modal = document.getElementById('modalEdicao');
    const formEdicao = document.getElementById('formEdicao');

    modal?.querySelectorAll('[data-fechar-modal]').forEach((botao) => {
        botao.addEventListener('click', fecharModalEdicao);
    });
    modal?.addEventListener('click', (evento) => {
        if (evento.target === modal) fecharModalEdicao();
    });
    formEdicao?.addEventListener('submit', salvarEdicao);
    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape' && modal?.classList.contains('aberto')) {
            fecharModalEdicao();
        }
    });

    carregarCategorias();
    buscarProdutos();
}

document.addEventListener('DOMContentLoaded', () => {
    inicializarFormulario();
    inicializarListaProdutos();
});
