"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
  criado_em: string;
};

const perfilLabel: Record<string, string> = {
  administrador: "Administrador",
  recepcionista: "Recepcionista",
  mecanico: "Mecânico",
  financeiro: "Financeiro",
};

const perfilCor: Record<string, string> = {
  administrador: "bg-red-100 text-red-700",
  recepcionista: "bg-blue-100 text-blue-700",
  mecanico: "bg-yellow-100 text-yellow-700",
  financeiro: "bg-green-100 text-green-700",
};

export default function UsuariosPage() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Bloqueia acesso se não for administrador
    if (usuario && usuario.perfil !== "administrador") {
      router.push("/");
      return;
    }

    async function carregar() {
      const { data } = await supabase
        .from("usuarios")
        .select("*")
        .order("nome");
      setUsuarios(data || []);
      setLoading(false);
    }
    carregar();
  }, [usuario]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-zinc-600" />
          <h1 className="text-2xl font-bold text-zinc-800">Usuários</h1>
        </div>
        <Button
          onClick={() => router.push("/usuarios/novo")}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          + Novo Usuário
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-zinc-400 text-sm">Carregando...</p>
        ) : usuarios.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum usuário cadastrado.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">E-mail</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Perfil</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Desde</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr
                  key={u.id}
                  onClick={() => router.push(`/usuarios/${u.id}`)}
                  className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-zinc-800">{u.nome}</td>
                  <td className="px-4 py-3 text-zinc-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${perfilCor[u.perfil]}`}>
                      {perfilLabel[u.perfil]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${u.ativo ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                      {u.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {new Date(u.criado_em).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}