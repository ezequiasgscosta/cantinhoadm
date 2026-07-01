"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface PedidoRelatorio {
  total: number;
  status: "Pendente" | "Preparando" | "Entregue";
  created_at: string;
}

export default function Relatorios() {
  const [loading, setLoading] = useState(true);
  const [totalPedidos, setTotalPedidos] = useState(0);
  const [faturamentoBruto, setFaturamentoBruto] = useState(0);
  const [ticketMedio, setTicketMedio] = useState(0);
  
  // Contadores de status
  const [qtdPendentes, setQtdPendentes] = useState(0);
  const [qtdPreparando, setQtdPreparando] = useState(0);
  const [qtdEntregues, setQtdEntregues] = useState(0);

  // Valores financeiros por status
  const [valorEntregue, setValorEntregue] = useState(0);
  const [valorEmAberto, setValorEmAberto] = useState(0);

  async function gerarRelatorios() {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("pedidos")
        .select("total, status, created_at");

      if (error) throw error;

      const pedidos = (data || []) as PedidoRelatorio[];
      
      // Inicializadores
      let bruto = 0;
      let pendentes = 0;
      let preparando = 0;
      let entregues = 0;
      let vEntregue = 0;
      let vAberto = 0;

      pedidos.forEach((p) => {
        const valor = Number(p.total) || 0;
        bruto += valor;

        if (p.status === "Entregue") {
          entregues += 1;
          vEntregue += valor;
        } else if (p.status === "Preparando") {
          preparando += 1;
          vAberto += valor;
        } else {
          pendentes += 1;
          vAberto += valor;
        }
      });

      setTotalPedidos(pedidos.length);
      setFaturamentoBruto(bruto);
      setTicketMedio(pedidos.length > 0 ? bruto / pedidos.length : 0);
      
      setQtdPendentes(pendentes);
      setQtdPreparando(preparando);
      setQtdEntregues(entregues);
      
      setValorEntregue(vEntregue);
      setValorEmAberto(vAberto);

    } catch (err) {
      console.error("Erro ao processar relatórios:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    gerarRelatorios();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-pink-600 font-semibold animate-pulse">Consolidando métricas e relatórios...</p>
      </div>
    );
  }

  // Cálculos de porcentagem para as barras de progresso
  const pctPendente = totalPedidos > 0 ? (qtdPendentes / totalPedidos) * 100 : 0;
  const pctPreparando = totalPedidos > 0 ? (qtdPreparando / totalPedidos) * 100 : 0;
  const pctEntregue = totalPedidos > 0 ? (qtdEntregues / totalPedidos) * 100 : 0;

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-6 md:p-10">
      {/* CABEÇALHO */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Relatórios Gerenciais 📊</h1>
          <p className="text-gray-500 text-sm mt-1">
            Análise detalhada do desempenho de vendas, conversão e métricas operacionais.
          </p>
        </div>
        <button 
          onClick={gerarRelatorios}
          className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-5 py-2.5 rounded-xl text-sm shadow-sm transition-all cursor-pointer"
        >
          📈 Atualizar Gráficos
        </button>
      </header>

      {/* ENQUADRAMENTO DE KPI'S ADICIONAIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Média por Pedido (Ticket)</span>
          <h3 className="text-2xl font-bold text-gray-800">R$ {ticketMedio.toFixed(2)}</h3>
          <p className="text-xs text-gray-400 mt-2">Valor médio gasto por cada cliente</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Dinheiro em Caixa (Líquido)</span>
          <h3 className="text-2xl font-bold text-green-600">R$ {valorEntregue.toFixed(2)}</h3>
          <p className="text-xs text-green-500 mt-2">✓ Referente aos pedidos já entregues</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Capital em Produção</span>
          <h3 className="text-2xl font-bold text-orange-500">R$ {valorEmAberto.toFixed(2)}</h3>
          <p className="text-xs text-orange-400 mt-2">Ativos em andamento/não finalizados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* COMPORTAMENTO VOLUMÉTRICO DE PEDIDOS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Divisão Operacional</h2>
          <p className="text-xs text-gray-400 mb-6">Proporção e volume de pedidos por etapa de funil.</p>
          
          <div className="space-y-5">
            {/* Barra Entregue */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <span className="flex items-center gap-2">🟢 Entregues</span>
                <span className="font-bold">{qtdEntregues} ({pctEntregue.toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${pctEntregue}%` }} />
              </div>
            </div>

            {/* Barra Preparando */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <span className="flex items-center gap-2">🟡 No Forno / Preparando</span>
                <span className="font-bold">{qtdPreparando} ({pctPreparando.toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-yellow-500 h-full rounded-full transition-all duration-500" style={{ width: `${pctPreparando}%` }} />
              </div>
            </div>

            {/* Barra Pendente */}
            <div className="space-y-1">
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <span className="flex items-center gap-2">🟠 Pendentes</span>
                <span className="font-bold">{qtdPendentes} ({pctPendente.toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full transition-all duration-500" style={{ width: `${pctPendente}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* METRICAS DE CONVERSÃO RESUMIDAS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Sumário de Performance</h2>
            <p className="text-xs text-gray-400 mb-6">Métricas absolutas acumuladas do sistema.</p>
            
            <div className="divide-y divide-gray-100">
              <div className="py-3 flex justify-between text-sm">
                <span className="text-gray-500">Volume Total de Pedidos</span>
                <span className="font-bold text-gray-800">{totalPedidos} ordens</span>
              </div>
              <div className="py-3 flex justify-between text-sm">
                <span className="text-gray-500">Volume Financeiro Total</span>
                <span className="font-bold text-gray-800">R$ {faturamentoBruto.toFixed(2)}</span>
              </div>
              <div className="py-3 flex justify-between text-sm">
                <span className="text-gray-500">Taxa de Conclusão de Encomendas</span>
                <span className="font-bold text-green-600">
                  {totalPedidos > 0 ? ((qtdEntregues / totalPedidos) * 100).toFixed(1) : "0"}%
                </span>
              </div>
            </div>
          </div>

          <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100/60 text-xs text-pink-700 font-medium mt-4">
            💡 <strong>Dica de Insights:</strong> A sua taxa de conclusão mostra a velocidade com que transforma pedidos em dinheiro real na conta. Mantenha os pedidos em "Preparando" o menor tempo possível!
          </div>
        </div>

      </div>
    </div>
  );
}