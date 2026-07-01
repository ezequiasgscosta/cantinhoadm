"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Pedido {
  id: number;
  created_at: string;
  nome_cliente: string;
  descricao_bolo: string;
  total: number;
  status: "Pendente" | "Preparando" | "Entregue";
}

export default function Pedidos() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [filtroStatus, setFiltroStatus] = useState<string>("Todos");
  const [loading, setLoading] = useState(true);

  // Função para buscar os pedidos do Supabase
  async function carregarPedidos() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setPedidos((data || []) as Pedido[]);
    } catch (err) {
      console.error("Erro ao carregar pedidos:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarPedidos();
  }, []);

  // Função para avançar o status do pedido direto pelo painel
  const avancarStatus = async (id: number, statusAtual: string) => {
    let novoStatus = statusAtual;
    if (statusAtual === "Pendente") novoStatus = "Preparando";
    else if (statusAtual === "Preparando") novoStatus = "Entregue";
    else return; // Se já estiver entregue, não faz nada

    try {
      const { error } = await supabase
        .from("pedidos")
        .update({ status: novoStatus })
        .eq("id", id);

      if (error) throw error;

      // Atualiza o estado local para refletir a mudança na hora
      setPedidos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: novoStatus as any } : p))
      );
    } catch (err) {
      alert("Erro ao atualizar o status do pedido.");
      console.error(err);
    }
  };

  // Filtra os pedidos com base no botão clicado
  const pedidosFiltrados = pedidos.filter((pedido) => {
    if (filtroStatus === "Todos") return true;
    return pedido.status === filtroStatus;
  });

  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-pink-600 font-semibold animate-pulse">Carregando pedidos...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-6 md:p-10">
      {/* CABEÇALHO */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gerenciamento de Pedidos 🛒</h1>
          <p className="text-gray-500 text-sm mt-1">Acompanhe a produção e entrega dos seus bolos.</p>
        </div>
        
        <button 
          onClick={carregarPedidos}
          className="bg-white border border-pink-200 text-pink-600 font-semibold px-4 py-2 rounded-xl text-sm shadow-sm hover:bg-pink-50 transition-colors cursor-pointer"
        >
          🔄 Atualizar Lista
        </button>
      </header>

      {/* FILTROS DE STATUS */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["Todos", "Pendente", "Preparando", "Entregue"].map((status) => (
          <button
            key={status}
            onClick={() => setFiltroStatus(status)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              filtroStatus === status
                ? "bg-pink-500 text-white shadow-sm"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* GRID DE PEDIDOS */}
      <div className="grid grid-cols-1 gap-4">
        {pedidosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-pink-100 p-10 text-center text-gray-400">
            Nenhum pedido encontrado nesta categoria. 🍰
          </div>
        ) : (
          pedidosFiltrados.map((pedido) => (
            <div 
              key={pedido.id}
              className="bg-white p-5 rounded-2xl shadow-sm border border-pink-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:shadow-md"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-md">
                    #{pedido.id}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      pedido.status === "Entregue"
                        ? "bg-green-100 text-green-700"
                        : pedido.status === "Preparando"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {pedido.status}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(pedido.created_at).toLocaleDateString("pt-BR")} às{" "}
                    {new Date(pedido.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-800 mb-1">{pedido.nome_cliente}</h3>
                <p className="text-sm text-gray-600">{pedido.descricao_bolo}</p>
              </div>

              <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-6 border-t md:border-0 pt-3 md:pt-0 border-gray-100">
                <div>
                  <span className="text-xs text-gray-400 block text-left md:text-right">Valor Total</span>
                  <span className="text-xl font-bold text-pink-600">R$ {pedido.total.toFixed(2)}</span>
                </div>

                {pedido.status !== "Entregue" && (
                  <button
                    onClick={() => avancarStatus(pedido.id, pedido.status)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all cursor-pointer ${
                      pedido.status === "Pendente"
                        ? "bg-orange-500 hover:bg-orange-600"
                        : "bg-yellow-500 hover:bg-yellow-600"
                    }`}
                  >
                    {pedido.status === "Pendente" ? "Mudar para 'Preparando' 🗓️" : "Mudar para 'Entregue' ✅"}
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}