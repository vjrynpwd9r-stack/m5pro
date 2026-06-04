"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

type Cliente = {
  id: string;
  nome: string;
  tipo: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  cidade: string;
  estado: string;
};

export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("clientes")
        .select("id, nome, tipo, cpf_cnpj, telefone, email, cidade, estado")
        .order("nome");
      setClientes(data || []);
      setLoading(false);
    }
    carregar();
  }, []);

  const filtrados = clientes.filter((c) => {
    const termo = busca.toLowerCase();
    return (
      c.nome?.toLowerCase().includes(termo) ||
      c.cpf_cnpj?.toLowerCase().includes(termo) ||
      c.telefone?.toLowerCase().includes(termo) ||
      c.email?.toLowerCase().includes(termo) ||
      c.cidade?.toLowerCase().includes(termo)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-zinc-600" />
          <h1 className="text-2xl font-bold text-zinc-800">Clientes</h1>
        </div>
        <Button
          onClick={() => router.push("/clientes/novo")}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          + Novo Cliente
        </Button>
      </div>

      {/* Busca */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          placeholder="Buscar por nome, CPF, telefone, e-mail ou cidade..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-zinc-400 text-sm">Carregando...</p>
        ) : filtrados.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{busca ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado ainda."}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Nome</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">CPF/CNPJ</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Telefone</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Cidade</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => router.push(`/clientes/${c.id}`)}
                  className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-zinc-800">{c.nome}</td>
                  <td className="px-4 py-3 text-zinc-500">{c.tipo}</td>
                  <td className="px-4 py-3 text-zinc-500">{c.cpf_cnpj || "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">{c.telefone || "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {c.cidade ? `${c.cidade}/${c.estado}` : "—"}
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