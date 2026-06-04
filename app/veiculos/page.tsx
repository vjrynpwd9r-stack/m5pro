"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Car } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";

type Veiculo = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano_fab: number;
  cor: string;
  clientes: { nome: string };
};

export default function VeiculosPage() {
  const router = useRouter();
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("veiculos")
        .select("id, placa, marca, modelo, ano_fab, cor, clientes(nome)")
        .order("placa");
      setVeiculos((data as unknown as Veiculo[]) || []);
      setLoading(false);
    }
    carregar();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Car className="w-6 h-6 text-zinc-600" />
          <h1 className="text-2xl font-bold text-zinc-800">Veículos</h1>
        </div>
        <Button
          onClick={() => router.push("/veiculos/novo")}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          + Novo Veículo
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-8 text-center text-zinc-400 text-sm">Carregando...</p>
        ) : veiculos.length === 0 ? (
          <div className="p-8 text-center text-zinc-400">
            <Car className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhum veículo cadastrado ainda.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Placa</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Marca/Modelo</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Ano</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Cor</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Cliente</th>
              </tr>
            </thead>
            <tbody>
              {veiculos.map((v) => (
                <tr
                  key={v.id}
                  onClick={() => router.push(`/veiculos/${v.id}`)}
                  className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-bold text-zinc-800">{v.placa}</td>
                  <td className="px-4 py-3 text-zinc-800">{v.marca} {v.modelo}</td>
                  <td className="px-4 py-3 text-zinc-500">{v.ano_fab || "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">{v.cor || "—"}</td>
                  <td className="px-4 py-3 text-zinc-500">{v.clientes?.nome || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}