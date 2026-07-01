"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
  categoria: string;
}

interface Categoria {
  id: number;
  nome: string;
}

export default function GerenciarProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [filtroCategoria, setFiltroCategoria] = useState("Todas");

  // Estados do formulário de Produto
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [imagemUrl, setImagemUrl] = useState("");
  const [categoriaSelecionada, setCategoriaSelecionada] = useState("");

  // Estado do formulário de Nova Categoria
  const [novaCategoria, setNovaCategoria] = useState("");
  const [criandoCategoria, setCriandoCategoria] = useState(false);

  // Carrega tudo do Supabase
  async function carregarDados() {
    try {
      setLoading(true);

      // Busca as categorias
      const { data: cats, error: errCats } = await supabase
        .from("categorias")
        .select("*")
        .order("nome", { ascending: true });
      if (errCats) throw errCats;
      
      const listaCategorias = cats || [];
      setCategorias(listaCategorias);
      
      // Define a primeira categoria como padrão no formulário
      if (listaCategorias.length > 0 && !categoriaSelecionada) {
        setCategoriaSelecionada(listaCategorias[0].nome);
      }

      // Busca os produtos
      const { data: prods, error: errProds } = await supabase
        .from("produtos")
        .select("*")
        .order("nome", { ascending: true });
      if (errProds) throw errProds;
      
      setProdutos((prods || []) as Produto[]);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  // Cria uma nova categoria no banco de dados
  const cadastrarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaCategoria.trim()) return;

    try {
      setCriandoCategoria(true);
      const { error } = await supabase
        .from("categorias")
        .insert([{ nome: novaCategoria.trim() }]);

      if (error) throw error;

      setNovaCategoria("");
      await carregarDados(); // Atualiza a lista e o select
    } catch (err) {
      alert("Erro ao criar categoria. Verifique se ela já existe.");
      console.error(err);
    } finally {
      setCriandoCategoria(false);
    }
  };

  // Adiciona um novo produto
  const cadastrarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !preco || !categoriaSelecionada) return;

    try {
      setSalvando(true);
      const { error } = await supabase.from("produtos").insert([
        {
          nome,
          descricao,
          preco: Number(preco),
          imagem_url: imagemUrl || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500",
          categoria: categoriaSelecionada,
        },
      ]);

      if (error) throw error;

      setNome("");
      setDescricao("");
      setPreco("");
      setImagemUrl("");
      carregarDados();
    } catch (err) {
      alert("Erro ao cadastrar o produto.");
      console.error(err);
    } finally {
      setSalvando(false);
    }
  };

  // Exclui um produto
  const excluirProduto = async (id: number) => {
    if (!confirm("Deseja remover este produto?")) return;
    try {
      const { error } = await supabase.from("produtos").delete().eq("id", id);
      if (error) throw error;
      setProdutos((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  // Filtra os produtos na tela
  const produtosFiltrados = produtos.filter((p) => {
    if (filtroCategoria === "Todas") return true;
    return p.categoria === filtroCategoria;
  });

  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-pink-600 font-semibold animate-pulse">Carregando cardápio dinâmico...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-6 md:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Cardápio do Cantinho 🍰</h1>
        <p className="text-gray-500 text-sm mt-1">Gerencie categorias, produtos e preços em tempo real.</p>
      </header>

      {/* BOTÕES DE FILTRO DINÂMICOS */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setFiltroCategoria("Todas")}
          className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            filtroCategoria === "Todas" ? "bg-pink-500 text-white" : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          Todas
        </button>
        {categorias.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFiltroCategoria(cat.nome)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filtroCategoria === cat.nome ? "bg-pink-500 text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {cat.nome}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA DOS FORMULÁRIOS (CADASTROS) */}
        <div className="space-y-6">
          
          {/* FORMULÁRIO 1: CRIAR CATEGORIA */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-pink-100">
            <h2 className="text-base font-bold text-gray-800 mb-3">➕ Criar Nova Categoria</h2>
            <form onSubmit={cadastrarCategoria} className="flex gap-2">
              <input
                type="text"
                placeholder="Ex: Tortas"
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-pink-400 text-gray-800"
                required
              />
              <button
                type="submit"
                disabled={criandoCategoria}
                className="bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-bold px-4 rounded-xl text-xs transition-colors cursor-pointer"
              >
                {criandoCategoria ? "..." : "Criar"}
              </button>
            </form>
          </div>

          {/* FORMULÁRIO 2: CADASTRAR PRODUTO */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">🍰 Novo Produto</h2>
            <form onSubmit={cadastrarProduto} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Nome do Produto</label>
                <input
                  type="text"
                  placeholder="Ex: Bolo de Morango Gourmet"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-pink-400 text-gray-800 font-medium"
                  required
                />
              </div>

              {/* SELECT DINÂMICO QUE BUSCA DO BANCO */}
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Categoria</label>
                <select
                  value={categoriaSelecionada}
                  onChange={(e) => setCategoriaSelecionada(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-pink-400 text-gray-800 font-medium"
                >
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.nome}>{cat.nome}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Ex: 65.00"
                  value={preco}
                  onChange={(e) => setPreco(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-pink-400 text-gray-800"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Link da Imagem</label>
                <input
                  type="text"
                  placeholder="https://linkdafoto.com/bolo.jpg"
                  value={imagemUrl}
                  onChange={(e) => setImagemUrl(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-pink-400 text-gray-800 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Ingredientes e detalhes..."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-pink-400 text-gray-800 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={salvando}
                className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                {salvando ? "Salvando..." : "Adicionar ao Cardápio +"}
              </button>
            </form>
          </div>
        </div>

        {/* LISTAGEM DOS PRODUTOS FILTRADOS */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {produtosFiltrados.length === 0 ? (
              <p className="text-sm text-gray-400 col-span-2 text-center py-8">Nenhum produto cadastrado nesta categoria. 🧁</p>
            ) : (
              produtosFiltrados.map((produto) => (
                <div key={produto.id} className="bg-white rounded-2xl border border-pink-100 p-4 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
                  <div>
                    <img src={produto.imagem_url} alt={produto.nome} className="w-full h-36 object-cover rounded-xl mb-3" />
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <h3 className="font-bold text-gray-800 text-sm sm:text-base">{produto.nome}</h3>
                        <span className="inline-block mt-1 bg-pink-50 text-pink-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {produto.categoria}
                        </span>
                      </div>
                      <span className="text-pink-600 font-bold text-sm whitespace-nowrap">R$ {produto.preco.toFixed(2)}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 line-clamp-2">{produto.descricao || "Sem descrição."}</p>
                  </div>

                  <button
                    onClick={() => excluirProduto(produto.id)}
                    className="w-full mt-4 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 rounded-xl text-xs transition-colors cursor-pointer text-center"
                  >
                    Remover do Cardápio 🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}