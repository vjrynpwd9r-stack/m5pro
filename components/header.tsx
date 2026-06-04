"use client";

import { useAuth } from "@/lib/auth-context";
import { LogoutButton } from "@/components/logout-button";

const perfilLabel: Record<string, string> = {
  administrador: "Administrador",
  recepcionista: "Recepcionista",
  mecanico: "Mecânico",
  financeiro: "Financeiro",
};

export function Header() {
  const { usuario } = useAuth();

  return (
    <header className="bg-[#0f1729] text-white px-6 py-3 flex items-center justify-between shadow-md">
      <h1 className="text-sm font-semibold text-slate-300 tracking-wide">
        Sistema de Gestão de Oficina Mecânica
      </h1>
      <div className="flex items-center gap-4">
        <span className="text-xs text-slate-400">
          {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
        </span>
        {usuario && (
          <div className="flex items-center gap-3 border-l border-slate-700 pl-4">
            <div className="text-right">
              <p className="text-xs font-medium text-white">{usuario.nome}</p>
              <p className="text-xs text-orange-400">{perfilLabel[usuario.perfil]}</p>
            </div>
          </div>
        )}
        <LogoutButton />
      </div>
    </header>
  );
}