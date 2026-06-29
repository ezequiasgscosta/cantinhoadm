"use client";
import { useState } from "react"
import Cabecario from "./Cabecario"
import MenuLateral from "./MenuLateral"

export default function LayoutCliente({
    children,
}: {
    children: React.ReactNode;
}) {
    const [menuAberto, setMenuAberto] = useState(false);

    return (
        <div className="min-h-screen flex-col">
            <Cabecario abrirMenu={setMenuAberto}/>
      
            <div className="flex flex-col flex-1">
                <main className="flex flex-row bg-gray-100">
                    {/* Condição para o menu lateral aparecer apenas se menuAberto for true */}
                    {menuAberto && <MenuLateral />}
                    {children}
                </main>
            </div>
        </div>
    );
}