"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface PedidoEntrega {
  id: number;
  created_at: string;
  nome_cliente: string;
  descricao_bolo: string;
  status: "Pendente" | "Preparando" | "Entregue";
}

export default function Entregas() {
  const [entregas, setEntregas] = useState<PedidoEntrega[]>([]);
  const [loading, setLoading] = useState(true);

  // Busca os pedidos que estão em rota ou já foram finalizados
  async function carregarEntregas() {
    try {
      setLoading(true);
      // Filtramos para trazer apenas quem está cozinhando/pronto ou já entregue
      const { data, error } = await supabase
        .from("pedidos")
        .select("id, created_at, nome_cliente, descricao_bolo, status")
        .in("status", ["Preparando", "Entregue"])
        .order("created_at", { ascending: false });

      if (error) throw error;

      setEntregas((data || []) as PedidoEntrega[]);
    } catch (err) {
      console.error("Erro ao carregar entregas:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarEntregas();
  }, []);

  // Função para concluir a entrega direto por esta tela
  const finalizarEntrega = async (id: number) => {
    try {
      const { error } = await supabase
        .from("pedidos")
        .update({ status: "Entregue" })
        .eq("id", id);

      if (error) throw error;

      // Atualiza a lista local na hora
      setEntregas((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: "Entregue" } : e))
      );
    } catch (err) {
      alert("Erro ao finalizar a entrega.");
      console.error(err);
    }
  };

  // Separa os pedidos em dois blocos dinâmicos
  const saindoParaEntrega = entregas.filter((e) => e.status === "Preparando");
  const entregasConcluidas = entregas.filter((e) => e.status === "Entregue");

  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-pink-600 font-semibold animate-pulse">Organizando mapa de entregas...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-6 md:p-10">
      {/* CABEÇALHO */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Painel de Entregas 🚚</h1>
          <p className="text-gray-500 text-sm mt-1">
            Controle quais bolos estão saindo do forno para o cliente e o histórico de envios.
          </p>
        </div>
        <button 
          onClick={carregarEntregas}
          className="bg-white border border-pink-200 text-pink-600 font-semibold px-4 py-2 rounded-xl text-sm shadow-sm hover:bg-pink-50 transition-colors cursor-pointer"
        >
          🔄 Atualizar Entregas
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COLUNA 1: PREPARANDO / PRONTO PARA SAIR */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              📦 A Caminho / Preparando
            </h2>
            <span className="bg-orange-100 text-orange-600 text-xs font-bold px-2.5 py-1 rounded-full">
              {saindoParaEntrega.length} pendentes
            </span>
          </div>

          {saindoParaEntrega.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400 text-sm">
              Nenhum bolo saindo para entrega agora. Todo mundo atendido! ✨
            </div>
          ) : (
            saindoParaEntrega.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm border border-pink-100 flex flex-col justify-between gap-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded">
                      Pedido #{item.id}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(item.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-800">{item.nome_cliente}</h3>
                  <p className="text-xs text-gray-500 mt-1">{item.descricao_bolo}</p>
                </div>

                <button
                  onClick={() => finalizarEntrega(item.id)}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-sm cursor-pointer"
                >
                  Confirmar que foi Entregue! ✓
                </button>
              </div>
            ))
          )}
        </div>

        {/* COLUNA 2: HISTÓRICO DE ENTREGAS CONCLUÍDAS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-2">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              ✅ Entregas Concluídas
            </h2>
            <span className="bg-green-100 text-green-600 text-xs font-bold px-2.5 py-1 rounded-full">
              {entregasConcluidas.length} hoje
            </span>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {entregasConcluidas.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
                Nenhuma entrega finalizada no lote atual. 
              </div>
            ) : (
              entregasConcluidas.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 flex items-center justify-between gap-4 opacity-80">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">{item.nome_cliente}</h4>
                    <p className="text-xs text-gray-400 truncate max-w-[200px] sm:max-w-xs">{item.descricao_bolo}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-green-600 font-bold block">✓ Entregue</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(item.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}