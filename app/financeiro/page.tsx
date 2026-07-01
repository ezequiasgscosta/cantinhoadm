"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface PedidoFinanceiro {
  id: number;
  created_at: string;
  nome_cliente: string;
  total: number;
  status: "Pendente" | "Preparando" | "Entregue";
}

interface ResumoMes {
  mesAno: string;
  total: number;
  qtdPedidos: number;
}

export default function Financeiro() {
  const [pedidos, setPedidos] = useState<PedidoFinanceiro[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalGeral, setTotalGeral] = useState(0);
  const [faturamentoMesAtual, setFaturamentoMesAtual] = useState(0);
  const [valorPendente, setValorPendente] = useState(0);
  const [relatorioMensal, setRelatorioMensal] = useState<ResumoMes[]>([]);

  useEffect(() => {
    async function carregarDadosFinanceiros() {
      try {
        setLoading(true);

        // Busca todos os pedidos para calcular os fluxos financeiros
        const { data, error } = await supabase
          .from("pedidos")
          .select("id, created_at, nome_cliente, total, status")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const listaPedidos = (data || []) as PedidoFinanceiro[];
        setPedidos(listaPedidos);

        // --- CÁLCULOS FINANCEIROS DINÂMICOS ---
        let bruto = 0;
        let mesAtual = 0;
        let pendente = 0;
        const agrupadoPorMes: { [key: string]: { total: number; qtd: number } } = {};

        const agora = new Date();
        const anoAtual = agora.getFullYear();
        const mesAtualIndex = agora.getMonth(); // 0 a 11

        listaPedidos.forEach((p) => {
          const valor = Number(p.total) || 0;
          const dataPedido = new Date(p.created_at);
          
          // 1. Total Geral (Apenas o que já foi ganho ou está em produção/entregue)
          bruto += valor;

          // 2. Faturamento do Mês Atual
          if (dataPedido.getFullYear() === anoAtual && dataPedido.getMonth() === mesAtualIndex) {
            mesAtual += valor;
          }

          // 3. Valor Pendente (Pedidos que ainda não foram concluídos/entregues)
          if (p.status === "Pendente" || p.status === "Preparando") {
            pendente += valor;
          }

          // 4. Agrupamento para o Relatório Mensal
          // Formato da chave: "MM/AAAA"
          const chaveMes = `${String(dataPedido.getMonth() + 1).padStart(2, "0")}/${dataPedido.getFullYear()}`;
          if (!agrupadoPorMes[chaveMes]) {
            agrupadoPorMes[chaveMes] = { total: 0, qtd: 0 };
          }
          agrupadoPorMes[chaveMes].total += valor;
          agrupadoPorMes[chaveMes].qtd += 1;
        });

        setTotalGeral(bruto);
        setFaturamentoMesAtual(mesAtual);
        setValorPendente(pendente);

        // Transforma o objeto agrupado num array ordenado para a tabela
        const relatorioFormatado = Object.keys(agrupadoPorMes).map((chave) => ({
          mesAno: chave,
          total: agrupadoPorMes[chave].total,
          qtdPedidos: agrupadoPorMes[chave].qtd,
        }));
        
        setRelatorioMensal(relatorioFormatado);

      } catch (err) {
        console.error("Erro ao processar dados financeiros:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarDadosFinanceiros();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-pink-600 font-semibold animate-pulse">Calculando fluxo de caixa...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-6 md:p-10">
      {/* CABEÇALHO */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Painel Financeiro 💳</h1>
        <p className="text-gray-500 text-sm mt-1">
          Controle as entradas, faturamento mensal e valores a receber do Cantinho da Vih.
        </p>
      </header>

      {/* CARTÕES DE CAIXA */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Receita Bruta acumulada */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wider block mb-2">Receita Total Acumulada</span>
          <h3 className="text-3xl font-bold text-gray-800">R$ {totalGeral.toFixed(2)}</h3>
          <p className="text-xs text-gray-400 mt-2">Todo o histórico do banco de dados</p>
        </div>

        {/* Faturamento do Mês */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wider block mb-2">Faturamento deste Mês</span>
          <h3 className="text-3xl font-bold text-pink-600">R$ {faturamentoMesAtual.toFixed(2)}</h3>
          <p className="text-xs text-green-500 mt-2">✓ Atualizado em tempo real</p>
        </div>

        {/* A Receber (Pendentes + Preparando) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
          <span className="text-sm font-medium text-gray-400 uppercase tracking-wider block mb-2">Previsão a Receber</span>
          <h3 className="text-3xl font-bold text-orange-500">R$ {valorPendente.toFixed(2)}</h3>
          <p className="text-xs text-orange-400 mt-2">Em produção ou aguardando entrega</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* TABELA DE EVOLUÇÃO MENSAL */}
        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6 lg:col-span-1">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Resumo por Mês</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3">Mês/Ano</th>
                  <th className="pb-3 text-center">Pedidos</th>
                  <th className="pb-3 text-right">Faturado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700 text-sm">
                {relatorioMensal.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50/50">
                    <td className="py-3 font-medium">{item.mesAno}</td>
                    <td className="py-3 text-center text-gray-500">{item.qtdPedidos}</td>
                    <td className="py-3 text-right font-bold text-green-600">R$ {item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* HISTÓRICO DE TRANSAÇÕES */}
        <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6 lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Fluxo de Entradas Recentes</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3 pl-2">ID / Data</th>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700 text-sm">
                {pedidos.slice(0, 10).map((pedido) => (
                  <tr key={pedido.id} className="hover:bg-pink-50/20 transition-colors">
                    <td className="py-3 pl-2 text-gray-400 text-xs">
                      #{pedido.id} <br />
                      {new Date(pedido.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="py-3 font-medium text-gray-900">{pedido.nome_cliente}</td>
                    <td className="py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          pedido.status === "Entregue"
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {pedido.status === "Entregue" ? "Confirmado" : "Em aberto"}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-right font-bold text-gray-800">
                      R$ {pedido.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}