"use client";

import { useRouter } from "next/navigation";

export default function MenuLateral() {
  const router = useRouter();

  // Função genérica de navegação para evitar criar uma função para cada botão
  const navegarPara = (rota: string) => {
    router.push(rota);
  };

  return (
    <aside 
      id="menu_hamburguer" 
      className="
        bg-blue-50 m-0 h-screen pt-15 p-5 border-r border-blue-100 flex flex-col gap-3
        w-64 fixed left-0 top-0 z-40 transition-transform duration-300 md:static md:w-1/4 md:translate-x-0
      "
    >
      {/* Dashboard */}
      <div 
        onClick={() => navegarPara(".")} 
        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-gray-700 hover:bg-pink-500 hover:text-white transition-all duration-200 group"
      >
        <span className="text-xl group-hover:scale-110 transition-transform">🏠</span>
        <h1 className="text-sm font-semibold tracking-wide">Dashboard</h1>
      </div>

      {/* Funcionários */}
      <div 
        onClick={() => navegarPara("/Funcionarios")} 
        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-gray-700 hover:bg-pink-500 hover:text-white transition-all duration-200 group"
      >
        <span className="text-xl group-hover:scale-110 transition-transform">👥</span>
        <h1 className="text-sm font-semibold tracking-wide">Funcionários</h1>
      </div>

      {/* Pedidos */}
      <div 
        onClick={() => navegarPara("Pedidos")} 
        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-gray-700 hover:bg-pink-500 hover:text-white transition-all duration-200 group"
      >
        <span className="text-xl group-hover:scale-110 transition-transform">🛒</span>
        <h1 className="text-sm font-semibold tracking-wide">Pedidos</h1>
      </div>

      {/* Usuários */}
      <div 
        onClick={() => navegarPara("/usuarios")} 
        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-gray-700 hover:bg-pink-500 hover:text-white transition-all duration-200 group"
      >
        <span className="text-xl group-hover:scale-110 transition-transform">👨‍💼</span>
        <h1 className="text-sm font-semibold tracking-wide">Usuários</h1>
      </div>

      {/* Financeiro */}
      <div 
        onClick={() => navegarPara("/financeiro")} 
        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-gray-700 hover:bg-pink-500 hover:text-white transition-all duration-200 group"
      >
        <span className="text-xl group-hover:scale-110 transition-transform">💳</span>
        <h1 className="text-sm font-semibold tracking-wide">Financeiro</h1>
      </div>

      {/* Entregas */}
      <div 
        onClick={() => navegarPara("/entregas")} 
        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-gray-700 hover:bg-pink-500 hover:text-white transition-all duration-200 group"
      >
        <span className="text-xl group-hover:scale-110 transition-transform">🚚</span>
        <h1 className="text-sm font-semibold tracking-wide">Entregas</h1>
      </div>

      {/* Marketing */}
      <div 
        onClick={() => navegarPara("/marketing")} 
        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-gray-700 hover:bg-pink-500 hover:text-white transition-all duration-200 group"
      >
        <span className="text-xl group-hover:scale-110 transition-transform">📢</span>
        <h1 className="text-sm font-semibold tracking-wide">Marketing</h1>
      </div>

      {/* Avaliações */}
      <div 
        onClick={() => navegarPara("/avaliacoes")} 
        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-gray-700 hover:bg-pink-500 hover:text-white transition-all duration-200 group"
      >
        <span className="text-xl group-hover:scale-110 transition-transform">⭐</span>
        <h1 className="text-sm font-semibold tracking-wide">Avaliações</h1>
      </div>

      {/* Relatórios */}
      <div 
        onClick={() => navegarPara("/relatorios")} 
        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-gray-700 hover:bg-pink-500 hover:text-white transition-all duration-200 group"
      >
        <span className="text-xl group-hover:scale-110 transition-transform">📈</span>
        <h1 className="text-sm font-semibold tracking-wide">Relatórios</h1>
      </div>

      {/* Item de Configurações */}
      <div 
        onClick={() => navegarPara("/configuracoes")} 
        className="mt-auto flex items-center gap-3 p-3 rounded-xl cursor-pointer text-gray-700 hover:bg-pink-500 hover:text-white transition-all duration-200 group"
      >
        <span className="text-xl group-hover:scale-110 transition-transform">⚙️</span>
        <h1 className="text-sm font-semibold tracking-wide">Configurações</h1>
      </div>
    </aside>
  );
}