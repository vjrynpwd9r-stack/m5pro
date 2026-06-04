"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Car, ClipboardList } from "lucide-react";

type Veiculo = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano_fab: number;
  ano_modelo: number;
  cor: string;
  chassi: string;
  renavam: string;
  combustivel: string;
  km_atual: number;
  observacoes: string;
  criado_em: string;
  clientes: { id: string; nome: string };
};

type OS = {
  id: string;
  numero: number;
  status: string;
  data_entrada: string;
  total_geral: number;
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

export default function VeiculoDetalhe() {
  const router = useRouter();
  const { id } = useParams();
  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [ordens, setOrdens] = useState<OS[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data: v } = await supabase
        .from("veiculos")
        .select("*, clientes(id, nome)")
        .eq("id", id)
        .single();
      setVeiculo(v as unknown as Veiculo);

      const { data: o } = await supabase
        .from("ordens_servico")
        .select("id, numero, status, data_entrada, total_geral")
        .eq("veiculo_id", id)
        .order("numero", { ascending: false });
      setOrdens(o || []);

      setLoading(false);
    }
    carregar();
  }, [id]);

  if (loading) return <p className="text-zinc-400 text-sm">Carregando...</p>;
  if (!veiculo) return <p className="text-zinc-400 text-sm">Veículo não encontrado.</p>;

  return (
    <div className="max-w-3xl space-y-6">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Car className="w-6 h-6 text-zinc-600" />
          <h1 className="text-2xl font-bold text-zinc-800 font-mono">{veiculo.placa}</h1>
          <span className="text-zinc-500 font-normal">{veiculo.marca} {veiculo.modelo}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/veiculos/${id}/editar`)}>
            Editar
          </Button>
          <Button variant="outline" onClick={() => router.push("/veiculos")}>
            Voltar
          </Button>
        </div>
      </div>

      {/* Dados do veículo */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-zinc-400 text-xs mb-1">Cliente</p>
          <p
            className="text-zinc-800 font-medium cursor-pointer hover:text-orange-500 transition-colors"
            onClick={() => router.push(`/clientes/${veiculo.clientes?.id}`)}
          >
            {veiculo.clientes?.nome}
          </p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">Combustível</p>
          <p className="text-zinc-800">{veiculo.combustivel || "—"}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">Ano Fabricação</p>
          <p className="text-zinc-800">{veiculo.ano_fab || "—"}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">Ano Modelo</p>
          <p className="text-zinc-800">{veiculo.ano_modelo || "—"}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">Cor</p>
          <p className="text-zinc-800">{veiculo.cor || "—"}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">KM Atual</p>
          <p className="text-zinc-800">{veiculo.km_atual ? veiculo.km_atual.toLocaleString("pt-BR") : "—"}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">Chassi</p>
          <p className="text-zinc-800 font-mono">{veiculo.chassi || "—"}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">RENAVAM</p>
          <p className="text-zinc-800 font-mono">{veiculo.renavam || "—"}</p>
        </div>
        {veiculo.observacoes && (
          <div className="col-span-2">
            <p className="text-zinc-400 text-xs mb-1">Observações</p>
            <p className="text-zinc-800">{veiculo.observacoes}</p>
          </div>
        )}
        <div className="col-span-2">
          <p className="text-zinc-400 text-xs mb-1">Cadastrado em</p>
          <p className="text-zinc-800">{new Date(veiculo.criado_em).toLocaleDateString("pt-BR")}</p>
        </div>
      </div>

      {/* Ordens de Serviço */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-4 h-4 text-zinc-500" />
          <h2 className="font-semibold text-zinc-700">Ordens de Serviço ({ordens.length})</h2>
        </div>
        {ordens.length === 0 ? (
          <p className="text-sm text-zinc-400">Nenhuma OS registrada para este veículo.</p>
        ) : (
          <div className="space-y-2">
            {ordens.map((os) => (
              <div
                key={os.id}
                onClick={() => router.push(`/ordens-servico/${os.id}`)}
                className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-zinc-800">#{os.numero}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCor[os.status]}`}>
                    {statusLabel[os.status]}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-zinc-800">R$ {os.total_geral?.toFixed(2)}</p>
                  <p className="text-zinc-400 text-xs">{new Date(os.data_entrada).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}