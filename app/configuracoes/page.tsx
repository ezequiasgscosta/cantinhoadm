"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Configuracoes() {
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  // Estados dos campos do formulário
  const [nomeLoja, setNomeLoja] = useState("");
  const [telefone, setTelefone] = useState("");
  const [lojaAberta, setLojaAberta] = useState(true);

  // Carrega as configurações atuais salvas no Supabase
  async function carregarConfiguracoes() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("configuracoes_loja")
        .select("*")
        .eq("id", 1)
        .single();

      if (error) throw error;

      if (data) {
        setNomeLoja(data.nome_loja);
        setTelefone(data.telefone || "");
        setLojaAberta(data.loja_aberta);
      }
    } catch (err) {
      console.error("Erro ao carregar configurações:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  // Salva as alterações feitas de volta no banco de dados
  const salvarConfiguracoes = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSalvando(true);
      setMensagemSucesso("");

      const { error } = await supabase
        .from("configuracoes_loja")
        .update({
          nome_loja: nomeLoja,
          telefone: telefone,
          loja_aberta: lojaAberta,
        })
        .eq("id", 1);

      if (error) throw error;

      setMensagemSucesso("Configurações salvas com sucesso! ✨");
      
      // Remove a mensagem de sucesso após 3 segundos
      setTimeout(() => setMensagemSucesso(""), 3000);
    } catch (err) {
      alert("Erro ao salvar as configurações.");
      console.error(err);
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-pink-600 font-semibold animate-pulse">Carregando painel de configurações...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-6 md:p-10">
      {/* CABEÇALHO */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Configurações do Sistema ⚙️</h1>
        <p className="text-gray-500 text-sm mt-1">
          Gerencie as informações públicas e o comportamento operacional da sua loja de bolos.
        </p>
      </header>

      <div className="max-w-2xl bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-pink-100">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-3">Perfil da Loja</h2>
        
        <form onSubmit={salvarConfiguracoes} className="space-y-6">
          
          {/* CAMPO: NOME DA LOJA */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Nome do Estabelecimento</label>
            <input
              type="text"
              value={nomeLoja}
              onChange={(e) => setNomeLoja(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 font-medium text-gray-800 transition-all"
              required
            />
          </div>

          {/* CAMPO: TELEFONE */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-1">Telefone / WhatsApp de Contato</label>
            <input
              type="text"
              placeholder="(00) 00000-0000"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-pink-400 text-gray-800 transition-all"
            />
          </div>

          {/* CAMPO: STATUS DA LOJA (ABERTA/FECHADA) */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200/60 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-0.5">Funcionamento do Site</h3>
              <p className="text-xs text-gray-400">
                Se desativado, os clientes não conseguirão fechar novos pedidos no carrinho.
              </p>
            </div>
            
            {/* Toggle Switch em Tailwind */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={lojaAberta}
                onChange={(e) => setLojaAberta(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
            </label>
          </div>

          {/* MENSAGEM DE SUCESSO FEEDBACK */}
          {mensagemSucesso && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-700 font-semibold rounded-xl text-sm text-center animate-fade-in">
              {mensagemSucesso}
            </div>
          )}

          {/* BOTÃO SALVAR */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={salvando}
              className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-sm cursor-pointer"
            >
              {salvando ? "Guardando alterações..." : "Salvar Configurações"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}