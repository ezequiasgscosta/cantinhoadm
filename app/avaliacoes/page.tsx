"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Avaliacao {
  id: number;
  created_at: string;
  nome_cliente: string;
  nota: number;
  comentario: string;
  aprovado: boolean;
}

export default function Avaliacoes() {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [mediaNota, setMediaNota] = useState(5.0);

  // Carrega todas as avaliações vindas do Supabase
  async function carregarAvaliacoes() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("avaliacoes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const lista = (data || []) as Avaliacao[];
      setAvaliacoes(lista);

      // --- CÁLCULO DINÂMICO DA MÉDIA DE ESTRELAS ---
      if (lista.length > 0) {
        const soma = lista.reduce((acc, curr) => acc + curr.nota, 0);
        setMediaNota(soma / lista.length);
      } else {
        setMediaNota(5.0);
      }

    } catch (err) {
      console.error("Erro ao carregar avaliações:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarAvaliacoes();
  }, []);

  // Oculta ou exibe o comentário no site (Moderação)
  const alternarStatusAprovacao = async (id: number, statusAtual: boolean) => {
    try {
      const { error } = await supabase
        .from("avaliacoes")
        .update({ aprovado: !statusAtual })
        .eq("id", id);

      if (error) throw error;

      setAvaliacoes((prev) =>
        prev.map((a) => (a.id === id ? { ...a, aprovado: !statusAtual } : a))
      );
    } catch (err) {
      console.error(err);
    }
  };

  // Exibe estrelas de forma visual baseada no número (1 a 5)
  const renderizarEstrelas = (nota: number) => {
    return "⭐".repeat(nota);
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-pink-600 font-semibold animate-pulse">Coletando depoimentos dos clientes...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-6 md:p-10">
      {/* CABEÇALHO */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Avaliações dos Clientes ⭐</h1>
          <p className="text-gray-500 text-sm mt-1">
            Veja o feedback de quem comprou e modere o que aparece no site do Cantinho da Vih.
          </p>
        </div>

        {/* BOX DE MÉDIA GERAL */}
        <div className="bg-white px-5 py-3 rounded-2xl shadow-sm border border-pink-100 flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-gray-400 block font-medium">Nota Média</span>
            <span className="text-xl font-bold text-gray-800">{mediaNota.toFixed(1)} de 5.0</span>
          </div>
          <span className="text-2xl bg-amber-50 p-2 rounded-xl text-amber-500 font-bold">★</span>
        </div>
      </header>

      {/* DETALHAMENTO DE DEPOIMENTOS */}
      <div className="space-y-4">
        {avaliacoes.length === 0 ? (
          <div className="bg-white p-10 rounded-2xl text-center border border-pink-100 text-gray-400">
            Ainda não há nenhuma avaliação registrada no banco de dados. 🍰
          </div>
        ) : (
          avaliacoes.map((item) => (
            <div 
              key={item.id}
              className={`bg-white p-6 rounded-2xl shadow-sm border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                !item.aprovado ? "border-red-100 bg-red-50/10 opacity-70" : "border-pink-100"
              }`}
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800 text-base">{item.nome_cliente}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(item.created_at).toLocaleDateString("pt-BR")}
                  </span>
                </div>
                
                {/* Estrelas */}
                <div className="text-sm tracking-tight">{renderizarEstrelas(item.nota)}</div>
                
                {/* Comentário */}
                <p className="text-sm text-gray-600 italic">
                  "{item.comentario || "O cliente não deixou nenhum comentário escrito, apenas a nota."}"
                </p>
              </div>

              {/* BOTÕES DE MODERAÇÃO */}
              <div className="flex sm:flex-col items-end gap-2 justify-between sm:justify-center border-t sm:border-0 pt-3 sm:pt-0 border-gray-100">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full block mb-1 ${
                  item.aprovado ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {item.aprovado ? "Aparecendo no Site" : "Ocultado"}
                </span>

                <button
                  onClick={() => alternarStatusAprovacao(item.id, item.aprovado)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    item.aprovado 
                      ? "bg-gray-100 hover:bg-red-100 hover:text-red-700 text-gray-600" 
                      : "bg-pink-500 hover:bg-pink-600 text-white"
                  }`}
                >
                  {item.aprovado ? "Ocultar Comentário 👁️‍🗨️" : "Aprovar e Publicar ✓"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}