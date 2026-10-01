(function () {
    const STORAGE_KEYS = {
        clientes: "clientes",
        atendentes: "atendentes",
        ingredientes: "ingredientes",
        produtos: "produtos",
        encomendas: "encomendas",
        vendas: "vendas"
    };

    function getStorageItem(key, fallback) {
        try {
            const value = localStorage.getItem(key);
            return value ? JSON.parse(value) : fallback;
        } catch (error) {
            console.warn("Não foi possível ler o armazenamento local:", error);
            return fallback;
        }
    }

    function setStorageItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return value;
        } catch (error) {
            console.warn("Não foi possível salvar no armazenamento local:", error);
            return value;
        }
    }

    function getClientes() {
        return getStorageItem(STORAGE_KEYS.clientes, []);
    }

    function saveClientes(clientes) {
        return setStorageItem(STORAGE_KEYS.clientes, clientes);
    }

    function getAtendentes() {
        return getStorageItem(STORAGE_KEYS.atendentes, []);
    }

    function saveAtendentes(atendentes) {
        return setStorageItem(STORAGE_KEYS.atendentes, atendentes);
    }

    function getIngredientes() {
        const ingredientes = getStorageItem(STORAGE_KEYS.ingredientes, null);

        if (Array.isArray(ingredientes)) {
            return ingredientes;
        }

        const ingredientesPadrao = [
            { id: "ingrediente-acucar", nome: "Açúcar", categoria: "Açúcares", quantidade: 8, unidade: "kg", minimo: 3 },
            { id: "ingrediente-chocolate-leite", nome: "Chocolate ao Leite", categoria: "Chocolates", quantidade: 4, unidade: "kg", minimo: 3 },
            { id: "ingrediente-chocolate-po", nome: "Chocolate em Pó", categoria: "Chocolates", quantidade: 4.5, unidade: "kg", minimo: 2 },
            { id: "ingrediente-creme-leite", nome: "Creme de Leite", categoria: "Laticínios", quantidade: 6, unidade: "un", minimo: 4 },
            { id: "ingrediente-farinha", nome: "Farinha de Trigo", categoria: "Farinhas", quantidade: 12, unidade: "kg", minimo: 3 },
            { id: "ingrediente-fermento", nome: "Fermento em Pó", categoria: "Farinhas", quantidade: 0.3, unidade: "kg", minimo: 0.5 },
            { id: "ingrediente-leite-condensado", nome: "Leite Condensado", categoria: "Laticínios", quantidade: 18, unidade: "un", minimo: 5 }
        ];

        saveIngredientes(ingredientesPadrao);
        return ingredientesPadrao;
    }

    function saveIngredientes(ingredientes) {
        return setStorageItem(STORAGE_KEYS.ingredientes, ingredientes);
    }

    function getProdutos() {
        const produtos = getStorageItem(STORAGE_KEYS.produtos, []);

        if (!produtos.length) {
            const produtosPadrao = [
                { id: 1, nome: "Bolo de Chocolate", categoria: "Bolos", preco: 85, estoque: 12 },
                { id: 2, nome: "Cheesecake", categoria: "Sobremesas", preco: 95, estoque: 8 },
                { id: 3, nome: "Torta de Limão", categoria: "Tortas", preco: 65, estoque: 5 },
                { id: 4, nome: "Cupcake Baunilha", categoria: "Cupcakes", preco: 12, estoque: 18 },
                { id: 5, nome: "Cookie Tradicional", categoria: "Cookies", preco: 8, estoque: 30 },
                { id: 6, nome: "Brigadeiro Gourmet", categoria: "Doces", preco: 4.5, estoque: 40 }
            ];

            saveProdutos(produtosPadrao);
            return produtosPadrao;
        }

        return produtos;
    }

    function saveProdutos(produtos) {
        return setStorageItem(STORAGE_KEYS.produtos, produtos);
    }

    function getEncomendas() {
        return getStorageItem(STORAGE_KEYS.encomendas, []);
    }

    function saveEncomendas(encomendas) {
        return setStorageItem(STORAGE_KEYS.encomendas, encomendas);
    }

    function getVendas() {
        return getStorageItem(STORAGE_KEYS.vendas, []);
    }

    function saveVendas(vendas) {
        return setStorageItem(STORAGE_KEYS.vendas, vendas);
    }

    function formatCurrency(value) {
        const numero = Number(value || 0);
        return numero.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    }

    function formatDate(value) {
        if (!value) {
            return "";
        }

        const data = new Date(value);

        if (Number.isNaN(data.getTime())) {
            return value;
        }

        return data.toLocaleDateString("pt-BR");
    }

    window.DoceMagiaStorage = {
        keys: STORAGE_KEYS,
        getClientes,
        saveClientes,
        getAtendentes,
        saveAtendentes,
        getIngredientes,
        saveIngredientes,
        getProdutos,
        saveProdutos,
        getEncomendas,
        saveEncomendas,
        getVendas,
        saveVendas,
        formatCurrency,
        formatDate
    };
})();
