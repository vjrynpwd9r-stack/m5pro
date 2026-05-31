"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

type OS = {
  id: string;
  numero: number;
  status: string;
  data_entrada: string;
  descricao_problema: string;
  total_geral: number;
  clientes: { nome: string };
  veiculos: { placa: string; modelo: string };
};

const statusCor: Record<string, string> = {
  aberta: "bg-blue-100 text-blue-700",
  em_andamento: "bg-yellow-100 text-yellow-700",
  aguardando_peca: "bg-orange-100 text-orange-700",
  concluida: "bg-green-100 text-green-700",
  cancelada: "bg-red-100 text-red-700",
};

const statusLabel: Record<string, string> = {
  aberta: "Aberta",
  em_andamento: "Em andamento",
  aguardando_peca: "Aguardando peça",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export default function OrdensServicoPage() {
  const router = useRouter();
  const [ordens, setOrdens] = useState<OS[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("ordens_servico")
        .select("id, numero, status, data_entrada, descricao_problema, total_geral, clientes(nome), veiculos(placa, modelo)")
        .order("numero", { ascending: false });
      setOrdens((data as unknown as OS[]) || []);
      setLoading(false);
    }
    carregar();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-zinc-600" />
          <h1 className="text-2xl font-bold text-zinc-800">Ordens de Serviço</h1>
        </div>
        <Button
          onClick={() => router.push("/ordens-servico/nova")}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          + Nova OS
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-zinc-400 text-sm">Carregando...</p>
        ) : ordens.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">
            <ClipboardList className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma ordem de serviço ainda.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">OS</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Veículo</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Problema</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {ordens.map((os) => (
                <tr
                  key={os.id}
                  onClick={() => router.push(`/ordens-servico/${os.id}`)}
                  className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-bold text-zinc-800">#{os.numero}</td>
                  <td className="px-4 py-3 text-zinc-800">{os.clientes?.nome}</td>
                  <td className="px-4 py-3 text-zinc-500">{os.veiculos?.placa} — {os.veiculos?.modelo}</td>
                  <td className="px-4 py-3 text-zinc-500 max-w-xs truncate">{os.descricao_problema || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusCor[os.status]}`}>
                      {statusLabel[os.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-zinc-800">
                    {os.total_geral ? `R$ ${os.total_geral.toFixed(2)}` : "—"}
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