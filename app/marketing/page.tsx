"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Cupom {
  id: number;
  codigo: string;
  desconto_porcentagem: number;
  ativo: boolean;
}

interface ProdutoMaisVendido {
  nome: string;
  quantidade: number;
}

export default function Marketing() {
  const [cupons, setCupons] = useState<Cupom[]>([]);
  const [novoCodigo, setNovoCodigo] = useState("");
  const [novoDesconto, setNovoDesconto] = useState("");
  const [maisVendidos, setMaisVendidos] = useState<ProdutoMaisVendido[]>([]);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [loading, setLoading] = useState(true);

  // Carrega os dados de marketing do Supabase
  async function carregarDadosMarketing() {
    try {
      setLoading(true);

      // 1. Busca os cupões cadastrados
      const { data: cuponsData } = await supabase
        .from("cupons")
        .select("*")
        .order("created_at", { ascending: false });
      setCupons(cuponsData || []);

      // 2. Busca os pedidos para processar inteligência de vendas (Produtos mais vendidos)
      const { data: pedidosData } = await supabase
        .from("pedidos")
        .select("descricao_bolo");

      if (pedidosData) {
        setTotalPedidos(pedidosData.length);

        // Contagem inteligente de quais produtos aparecem mais nas descrições
        const contagemProdutos: { [key: string]: number } = {};
        pedidosData.forEach((p) => {
          if (p.descricao_bolo) {
            const produto = p.descricao_bolo.trim();
            contagemProdutos[produto] = (contagemProdutos[produto] || 0) + 1;
          }
        });

        // Transforma em array e ordena do mais vendido para o menos vendido
        const ordenados = Object.keys(contagemProdutos).map((nome) => ({
          nome,
          quantidade: contagemProdutos[nome],
        })).sort((a, b) => b.quantidade - a.quantidade);

        setMaisVendidos(ordenados.slice(0, 3)); // Pega o Top 3
      }

    } catch (err) {
      console.error("Erro ao carregar dados de marketing:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDadosMarketing();
  }, []);

  // Cria um novo cupom de desconto no banco de dados
  const criarCupom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoCodigo || !novoDesconto) return;

    try {
      const { error } = await supabase
        .from("cupons")
        .insert([
          {
            codigo: novoCodigo.toUpperCase().replace(/\s+/g, ""), // Remove espaços e deixa maiúsculo
            desconto_porcentagem: Number(novoDesconto),
            ativo: true
          }
        ]);

      if (error) throw error;

      setNovoCodigo("");
      setNovoDesconto("");
      carregarDadosMarketing(); // Recarrega a lista
    } catch (err) {
      alert("Erro ao criar cupom. Verifique se o código já existe.");
      console.error(err);
    }
  };

  // Ativa ou desativa um cupom existente
  const alternarStatusCupom = async (id: number, statusAtual: boolean) => {
    try {
      const { error } = await supabase
        .from("cupons")
        .update({ ativo: !statusAtual })
        .eq("id", id);

      if (error) throw error;

      setCupons((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ativo: !statusAtual } : c))
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-pink-600 font-semibold animate-pulse">Preparando ferramentas de marketing...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-6 md:p-10">
      {/* CABEÇALHO */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Painel de Marketing 📢</h1>
        <p className="text-gray-500 text-sm mt-1">
          Crie promoções, acompanhe os seus produtos mais populares e aumente as vendas do Cantinho da Vih.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA 1: CRIAR CUPOM DE DESCONTO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Novo Cupom de Desconto 🏷️</h2>
          <form onSubmit={criarCupom} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Código do Cupom</label>
              <input
                type="text"
                placeholder="Ex: BOLO10"
                value={novoCodigo}
                onChange={(e) => setNovoCodigo(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400 font-mono uppercase"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1">Desconto (%)</label>
              <input
                type="number"
                placeholder="Ex: 10"
                min="1"
                max="100"
                value={novoDesconto}
                onChange={(e) => setNovoDesconto(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-pink-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
            >
              Ativar Novo Cupom +
            </button>
          </form>
        </div>

        {/* COLUNA 2: LISTA DE CUPONS E TOP PRODUTOS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* GERENCIAMENTO DE CUPONS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Cupons Ativos no Site</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 text-xs font-semibold">
                    <th className="pb-3">Código</th>
                    <th className="pb-3">Desconto</th>
                    <th className="pb-3 text-right">Ação / Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700 text-sm">
                  {cupons.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-gray-400 text-xs">
                        Nenhum cupom cadastrado ainda.
                      </td>
                    </tr>
                  ) : (
                    cupons.map((cupom) => (
                      <tr key={cupom.id} className="hover:bg-gray-50/50">
                        <td className="py-3 font-mono font-bold text-pink-600 uppercase">{cupom.codigo}</td>
                        <td className="py-3 font-semibold">{cupom.desconto_porcentagem}% OFF</td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => alternarStatusCupom(cupom.id, cupom.ativo)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                              cupom.ativo
                                ? "bg-green-100 text-green-700 hover:bg-red-100 hover:text-red-700"
                                : "bg-gray-100 text-gray-500 hover:bg-green-100 hover:text-green-700"
                            }`}
                          >
                            {cupom.ativo ? "● Ativo (Pausar)" : "○ Pausado (Ativar)"}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* INTELIGÊNCIA DE VENDAS: PRODUTOS MAIS VENDIDOS */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
            <h2 className="text-xl font-bold text-gray-800 mb-2">🍰 Top Bolos Queridinhos</h2>
            <p className="text-xs text-gray-400 mb-4">Descubra os sabores que os seus clientes mais compram automaticamente.</p>
            
            <div className="space-y-4">
              {maisVendidos.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Aguardando dados de vendas suficientes... 📊</p>
              ) : (
                maisVendidos.map((produto, index) => {
                  // Calcula a porcentagem de relevância do produto sobre o total
                  const porcentagem = totalPedidos > 0 ? (produto.quantidade / totalPedidos) * 100 : 0;
                  
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm font-medium text-gray-700">
                        <span>{index + 1}º - {produto.nome}</span>
                        <span className="text-gray-400 text-xs">{produto.quantidade} saídas</span>
                      </div>
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-pink-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(porcentagem, 10)}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}