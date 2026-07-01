"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface Usuario {
  id: string;
  created_at: string;
  nome: string;
  email: string;
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [pesquisa, setPesquisa] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Função para carregar os utilizadores do Supabase
  async function carregarUsuarios() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("usuarios") // Nome da sua tabela de utilizadores/clientes
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;

      setUsuarios((data || []) as Usuario[]);
    } catch (err) {
      console.error("Erro ao carregar utilizadores:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  // Filtra a lista com base no que foi digitado na barra de pesquisa
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const termo = pesquisa.toLowerCase();
    return (
      usuario.nome.toLowerCase().includes(termo) ||
      usuario.email.toLowerCase().includes(termo)
    );
  });

  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-pink-600 font-semibold animate-pulse">Carregando utilizadores...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-gray-50 p-6 md:p-10">
      {/* CABEÇALHO */}
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Clientes Cadastrados 👨‍💼</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie e visualize as pessoas que têm conta no Cantinho da Vih.
          </p>
        </div>
        
        <div className="text-sm font-semibold bg-pink-100 text-pink-700 px-4 py-2 rounded-xl shadow-sm text-center">
          Total: {usuarios.length} {usuarios.length === 1 ? "utilizador" : "utilizadores"}
        </div>
      </header>

      {/* BARRA DE PESQUISA */}
      <div className="mb-6 w-full max-w-md">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
            🔍
          </span>
          <input
            type="text"
            placeholder="Pesquisar por nome ou e-mail..."
            value={pesquisa}
            onChange={(e) => setPesquisa(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-pink-400 shadow-sm transition-all"
          />
        </div>
      </div>

      {/* TABELA / LISTA DE USUÁRIOS */}
      <div className="bg-white rounded-2xl shadow-sm border border-pink-100 p-6">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 text-sm font-medium">
                <th className="pb-3 pl-2">Nome</th>
                <th className="pb-3">E-mail</th>
                <th className="pb-3 pr-2 text-right">Data de Registo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700 text-sm">
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-400">
                    {pesquisa ? "Nenhum utilizador encontrado para esta pesquisa. 🤷‍♀️" : "Nenhum utilizador registado ainda. 👥"}
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((usuario) => (
                  <tr key={usuario.id} className="hover:bg-pink-50/30 transition-colors">
                    {/* Nome com um mini avatar simulado */}
                    <td className="py-4 pl-2 font-medium text-gray-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center font-bold text-xs uppercase">
                        {usuario.nome.substring(0, 2)}
                      </div>
                      {usuario.nome}
                    </td>
                    <td className="py-4 text-gray-500">{usuario.email}</td>
                    <td className="py-4 pr-2 text-right text-gray-400">
                      {new Date(usuario.created_at).toLocaleDateString("pt-BR")}
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