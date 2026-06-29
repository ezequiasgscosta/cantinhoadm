"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // Ajuste o caminho conforme sua pasta

interface Funcionario {
  id: number;
  nome: string;
  cargo: string;
  email: string;
  status: string;
}

export default function FuncionariosPage() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [carregando, setCarregando] = useState(true);
  
  // Estados para controlar o Modal de Cadastro
  const [modalAberto, setModalAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);

  // 1. Função para buscar dados do Supabase
  const buscarFuncionarios = async () => {
    setCarregando(true);
    const { data, error } = await supabase
      .from("funcionarios")
      .select("*")
      .order("id", { ascending: false }); // Traz os mais novos primeiro

    if (error) {
      console.error("Erro ao buscar funcionários:", error.message);
    } else if (data) {
      setFuncionarios(data);
    }
    setCarregando(false);
  };

  useEffect(() => {
    buscarFuncionarios();
  }, []);

  // 2. Função para salvar o funcionário no Supabase
  const lidarComCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !cargo || !email) return alert("Preencha todos os campos!");

    setEnviando(true);

    const { error } = await supabase
      .from("funcionarios")
      .insert([{ nome, cargo, email, status: "Ativo" }]); // Insere os dados

    if (error) {
      alert("Erro ao cadastrar: " + error.message);
    } else {
      // Limpa os campos do formulário
      setNome("");
      setCargo("");
      setEmail("");
      setModalAberto(false); // Fecha o modal
      buscarFuncionarios(); // Atualiza a lista na tela imediatamente
    }

    setEnviando(false);
  };

  return (
    <div className="p-6 w-full min-h-screen bg-gray-100 relative">
      
      {/* Cabeçalho da Página */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">🧑‍💼 Funcionários</h1>
          <p className="text-sm text-gray-500">Gerencie sua equipe em tempo real</p>
        </div>
        
        {/* Botão que abre o Modal */}
        <button 
          onClick={() => setModalAberto(true)}
          className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-colors shadow-sm"
        >
          + Novo Funcionário
        </button>
      </div>

      {/* Tabela de Funcionários */}
      {carregando ? (
        <p className="text-gray-500 text-sm">Carregando equipe...</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm font-semibold">
                  <th className="p-4">Nome</th>
                  <th className="p-4">Cargo</th>
                  <th className="p-4">E-mail</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {funcionarios.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-400">Nenhum funcionário cadastrado.</td>
                  </tr>
                ) : (
                  funcionarios.map((func) => (
                    <tr key={func.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{func.nome}</td>
                      <td className="p-4 text-gray-500">{func.cargo}</td>
                      <td className="p-4 text-gray-500">{func.email}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          func.status === "Ativo" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          {func.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- MODAL DE CADASTRO ----------------- */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-150">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Cadastrar Novo Funcionário</h2>
            
            <form onSubmit={lidarComCadastro} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Viviane Silva"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Cargo</label>
                <input 
                  type="text" 
                  value={cargo}
                  onChange={(e) => setCargo(e.target.value)}
                  placeholder="Ex: Atendimento / Social Media"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-pink-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">E-mail</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: vih@cantinho.com"
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-pink-500"
                  required
                />
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-2 justify-end mt-2">
                <button 
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  disabled={enviando}
                  className="bg-pink-500 hover:bg-pink-600 disabled:bg-pink-300 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
                >
                  {enviando ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}