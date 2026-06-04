"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

type Peca = {
  id: string;
  codigo: string;
  descricao: string;
  unidade: string;
  preco_custo: number;
  preco_venda: number;
  estoque_atual: number;
  estoque_minimo: number;
  ativo: boolean;
};

export default function EstoquePage() {
  const router = useRouter();
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("pecas")
        .select("*")
        .order("descricao");
      setPecas(data || []);
      setLoading(false);
    }
    carregar();
  }, []);

  const abaixoMinimo = pecas.filter((p) => p.estoque_atual <= p.estoque_minimo);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-zinc-600" />
          <h1 className="text-2xl font-bold text-zinc-800">Estoque</h1>
        </div>
        <Button
          onClick={() => router.push("/estoque/novo")}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          + Nova Peça
        </Button>
      </div>

      {/* Alerta estoque baixo */}
      {abaixoMinimo.length > 0 && (
        <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-700">
          ⚠️ {abaixoMinimo.length} peça(s) abaixo do estoque mínimo:{" "}
          <span className="font-medium">{abaixoMinimo.map((p) => p.descricao).join(", ")}</span>
        </div>
      )}

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-zinc-400 text-sm">Carregando...</p>
        ) : pecas.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">
            <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma peça cadastrada ainda.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Código</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Descrição</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Unidade</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-600">Custo</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-600">Venda</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-600">Estoque</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-600">Mínimo</th>
              </tr>
            </thead>
            <tbody>
              {pecas.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => router.push(`/estoque/${p.id}`)}
                  className={`border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors ${
                    p.estoque_atual <= p.estoque_minimo ? "bg-orange-50" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-mono text-zinc-500">{p.codigo || "—"}</td>
                  <td className="px-4 py-3 font-medium text-zinc-800">{p.descricao}</td>
                  <td className="px-4 py-3 text-zinc-500">{p.unidade}</td>
                  <td className="px-4 py-3 text-right text-zinc-500">R$ {p.preco_custo?.toFixed(2) || "—"}</td>
                  <td className="px-4 py-3 text-right text-zinc-800">R$ {p.preco_venda?.toFixed(2) || "—"}</td>
                  <td className={`px-4 py-3 text-right font-bold ${
                    p.estoque_atual <= p.estoque_minimo ? "text-orange-600" : "text-zinc-800"
                  }`}>
                    {p.estoque_atual}
                  </td>
                  <td className="px-4 py-3 text-right text-zinc-400">{p.estoque_minimo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}