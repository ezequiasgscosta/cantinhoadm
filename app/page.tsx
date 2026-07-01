"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

interface Metricas {
  totalVendas: number;
  totalPedidos: number;
  novosClientes: number;
  faturamentoMedio: number;
}

interface UltimoPedido {
  id: string | number;
  cliente: string;
  bolo: string;
  valor: number;
  status: "Pendente" | "Preparando" | "Entregue";
}

export default function Dashboard() {
  const [metricas, setMetricas] = useState<Metricas>({
    totalVendas: 0,
    totalPedidos: 0,
    novosClientes: 0,
    faturamentoMedio: 0,
  });

  const [ultimosPedidos, setUltimosPedidos] = useState<UltimoPedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarDadosDashboard() {
      try {
        setLoading(true);

        // 1. 🌟 BUSCA OS 5 ÚLTIMOS PEDIDOS REALIZADOS
        const { data: pedidosData, error: pedidosError } = await supabase
          .from("pedidos")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);

        if (pedidosError) throw pedidosError;

        const formatados: UltimoPedido[] = (pedidosData || []).map((p: any) => ({
          id: p.id,
          cliente: p.nome_cliente || "Cliente Anônimo",
          bolo: p.descricao_bolo || "Bolo Personalizado",
          valor: Number(p.total) || 0,
          status: p.status || "Pendente",
        }));
        setUltimosPedidos(formatados);

        // 2. 🌟 CONSULTA DINÂMICA DE MÉTRICAS (BUSCA TODOS OS PEDIDOS PARA CALCULAR)
        const { data: todosPedidos, error: metricasError } = await supabase
          .from("pedidos")
          .select("total, nome_cliente, status");

        if (metricasError) throw metricasError;

        if (todosPedidos && todosPedidos.length > 0) {
          // Calcula o total faturado somando a coluna 'total' de cada linha
          const totalVendas = todosPedidos.reduce((acc, p) => acc + (Number(p.total) || 0), 0);
          
          // Conta quantos registros existem na tabela
          const totalPedidos = todosPedidos.length;
          
          // Calcula a média (Faturamento / Quantidade de Pedidos)
          const faturamentoMedio = totalPedidos > 0 ? totalVendas / totalPedidos : 0;

          // Descobre quantos clientes únicos já compraram (evita contar o mesmo nome duas vezes)
          const clientesUnicos = new Set(todosPedidos.map(p => p.nome_cliente).filter(Boolean));
          const novosClientes = clientesUnicos.size;

          setMetricas({
            totalVendas,
            totalPedidos,
            novosClientes,
            faturamentoMedio
          });
        }

      } catch (err) {
        console.error("Erro ao carregar dados do dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarDadosDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-pink-600 font-semibold animate-pulse">Carregando dados reais...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-6 md:p-10">
      {/* CABEÇALHO */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Olá, Bem-vinda de volta! 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Aqui está o resumo em tempo real do Cantinho da Vih.</p>
      </header>

      {/* CARTÕES DE MÉTRICAS DINÂMICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Faturamento */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Faturamento Total</span>
            <span className="p-2 bg-green-50 text-green-600 rounded-lg text-xl">💰</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">R$ {metricas.totalVendas.toFixed(2)}</h3>
            <span className="text-xs text-green-500 font-medium">Soma de todos os pedidos</span>
          </div>
        </div>

        {/* Total de Pedidos */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Total de Pedidos</span>
            <span className="p-2 bg-pink-50 text-pink-500 rounded-lg text-xl">🍰</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{metricas.totalPedidos}</h3>
            <span className="text-xs text-pink-500 font-medium">Registrados no banco</span>
          </div>
        </div>

        {/* Clientes Únicos */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Clientes Cadastrados</span>
            <span className="p-2 bg-blue-50 text-blue-500 rounded-lg text-xl">👥</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{metricas.novosClientes}</h3>
            <span className="text-xs text-blue-500 font-medium">Clientes únicos</span>
          </div>
        </div>

        {/* Ticket Médio */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Ticket Médio</span>
            <span className="p-2 bg-purple-50 text-purple-500 rounded-lg text-xl">📈</span>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800">R$ {metricas.faturamentoMedio.toFixed(2)}</h3>
            <span className="text-xs text-purple-500 font-medium">Média por venda</span>
          </div>
        </div>
      </div>

      {/* TABELA DE ÚLTIMOS PEDIDOS */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">Últimos Pedidos Recebidos</h2>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-sm font-medium">
                <th className="pb-3 pl-2">Cliente</th>
                <th className="pb-3">Produto / Descrição</th>
                <th className="pb-3">Valor</th>
                <th className="pb-3 pr-2 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700 text-sm">
              {ultimosPedidos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    Nenhum pedido encontrado no banco de dados ainda. 😢
                  </td>
                </tr>
              ) : (
                ultimosPedidos.map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-pink-50/30 transition-colors">
                    <td className="py-4 pl-2 font-medium text-gray-900">{pedido.cliente}</td>
                    <td className="py-4 text-gray-500">{pedido.bolo}</td>
                    <td className="py-4 font-semibold text-pink-600">R$ {pedido.valor.toFixed(2)}</td>
                    <td className="py-4 pr-2 text-right">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          pedido.status === "Entregue"
                            ? "bg-green-100 text-green-700"
                            : pedido.status === "Preparando"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        {pedido.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}