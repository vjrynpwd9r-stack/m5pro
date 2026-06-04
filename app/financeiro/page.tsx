"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

type Lancamento = {
  id: string;
  tipo: string;
  categoria: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_pagamento: string;
  status: string;
  forma_pagamento: string;
};

const statusCor: Record<string, string> = {
  pendente: "bg-yellow-100 text-yellow-700",
  pago: "bg-green-100 text-green-700",
  cancelado: "bg-red-100 text-red-700",
};

const statusLabel: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
  cancelado: "Cancelado",
};

export default function FinanceiroPage() {
  const router = useRouter();
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    async function carregar() {
      let query = supabase
        .from("financeiro_lancamentos")
        .select("*")
        .order("data_vencimento", { ascending: false });

      if (filtro === "receita") query = query.eq("tipo", "receita");
      if (filtro === "despesa") query = query.eq("tipo", "despesa");
      if (filtro === "pendente") query = query.eq("status", "pendente");

      const { data } = await query;
      setLancamentos(data || []);
      setLoading(false);
    }
    carregar();
  }, [filtro]);

  const filtrados = lancamentos.filter((l) => {
    const termo = busca.toLowerCase();
    return (
      l.descricao?.toLowerCase().includes(termo) ||
      l.categoria?.toLowerCase().includes(termo) ||
      l.forma_pagamento?.toLowerCase().includes(termo) ||
      statusLabel[l.status]?.toLowerCase().includes(termo)
    );
  });

  const totalReceitas = lancamentos
    .filter((l) => l.tipo === "receita" && l.status === "pago")
    .reduce((acc, l) => acc + l.valor, 0);

  const totalDespesas = lancamentos
    .filter((l) => l.tipo === "despesa" && l.status === "pago")
    .reduce((acc, l) => acc + l.valor, 0);

  const totalPendente = lancamentos
    .filter((l) => l.status === "pendente")
    .reduce((acc, l) => acc + l.valor, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-zinc-600" />
          <h1 className="text-2xl font-bold text-zinc-800">Financeiro</h1>
        </div>
        <Button
          onClick={() => router.push("/financeiro/novo")}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          + Novo Lançamento
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
          <p className="text-xs text-zinc-400 mb-1">Receitas pagas</p>
          <p className="text-xl font-bold text-green-600">R$ {totalReceitas.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
          <p className="text-xs text-zinc-400 mb-1">Despesas pagas</p>
          <p className="text-xl font-bold text-red-500">R$ {totalDespesas.toFixed(2)}</p>
        </div>
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-4">
          <p className="text-xs text-zinc-400 mb-1">Pendentes</p>
          <p className="text-xl font-bold text-yellow-600">R$ {totalPendente.toFixed(2)}</p>
        </div>
      </div>

      {/* Filtros e busca */}
      <div className="flex gap-2 mb-4">
        {["todos", "receita", "despesa", "pendente"].map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              filtro === f
                ? "bg-orange-500 text-white"
                : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
            }`}
          >
            {f === "todos" ? "Todos" : f === "receita" ? "Receitas" : f === "despesa" ? "Despesas" : "Pendentes"}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          placeholder="Buscar por descrição, categoria ou forma de pagamento..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-zinc-400 text-sm">Carregando...</p>
        ) : filtrados.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">
            <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">{busca ? "Nenhum lançamento encontrado." : "Nenhum lançamento encontrado."}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Descrição</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Categoria</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Vencimento</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-600">Valor</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((l) => (
                <tr
                  key={l.id}
                  onClick={() => router.push(`/financeiro/${l.id}`)}
                  className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-zinc-800">{l.descricao}</td>
                  <td className="px-4 py-3 text-zinc-500">{l.categoria || "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(l.data_vencimento).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      l.tipo === "receita" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {l.tipo === "receita" ? "Receita" : "Despesa"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCor[l.status]}`}>
                      {statusLabel[l.status]}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-right font-medium ${
                    l.tipo === "receita" ? "text-green-600" : "text-red-500"
                  }`}>
                    {l.tipo === "despesa" ? "- " : ""}R$ {l.valor.toFixed(2)}
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