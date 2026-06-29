"use client";
import menuhamburguer from "../../public/hamburguer.png"
import Image from "next/image";
import { useState } from "react"
import FotoPerfil from "../../public/globe.svg";

export default function Cabecario({ 
  abrirMenu 
}: { 
  abrirMenu: React.Dispatch<React.SetStateAction<boolean>> 
}) {
  
  function MostrarEsconderMenuLateral() {
    abrirMenu((valorAnterior: boolean) => !valorAnterior);
  }


    // Seu retorno do JSX continua exatamente igual aqui para baixo...
  return (
    <header id="header" className="w-full flex-1 flex items-center sticky top-0 z-50 justify-between bg-pink-500 text-white pr-5 shadow">
      
        <div>
         <Image className="ml-5 cursor-pointer" 
         onClick={MostrarEsconderMenuLateral}
                src = {menuhamburguer}
                alt = "menuHamburgue"
                 width={50} 
                 height={50} 
                />
        </div>

      <div className="mr-8 w-3/7 text-2xl font-bold">
        <h1>Cantinho da Vih</h1>
      </div>

      <div className="ml-6">
        <Image 
          src={FotoPerfil} 
          alt="foto de perfil" 
          width={50} 
          height={50} 
        />
      </div>

    </header>
  );
}