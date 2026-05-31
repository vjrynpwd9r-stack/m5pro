"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { ClipboardList } from "lucide-react";

type OS = {
  id: string;
  numero: number;
  status: string;
  data_entrada: string;
  data_previsao: string;
  data_conclusao: string;
  km_entrada: number;
  km_saida: number;
  descricao_problema: string;
  diagnostico: string;
  observacoes: string;
  desconto: number;
  total_pecas: number;
  total_servicos: number;
  total_geral: number;
  clientes: { nome: string; telefone: string };
  veiculos: { placa: string; marca: string; modelo: string; ano_fab: number; cor: string };
};

type Peca = { id: string; descricao: string; quantidade: number; preco_unit: number; subtotal: number };
type Servico = { id: string; descricao: string; quantidade: number; preco_unit: number; subtotal: number };

const statusLabel: Record<string, string> = {
  aberta: "Aberta",
  em_andamento: "Em andamento",
  aguardando_peca: "Aguardando peça",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

const statusCor: Record<string, string> = {
  aberta: "bg-blue-100 text-blue-700",
  em_andamento: "bg-yellow-100 text-yellow-700",
  aguardando_peca: "bg-orange-100 text-orange-700",
  concluida: "bg-green-100 text-green-700",
  cancelada: "bg-red-100 text-red-700",
};

export default function OSDetalhe() {
  const router = useRouter();
  const { id } = useParams();
  const [os, setOs] = useState<OS | null>(null);
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [atualizandoStatus, setAtualizandoStatus] = useState(false);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("ordens_servico")
        .select("*, clientes(nome, telefone), veiculos(placa, marca, modelo, ano_fab, cor)")
        .eq("id", id)
        .single();
      setOs(data as unknown as OS);

      const { data: p } = await supabase.from("os_pecas").select("*").eq("os_id", id);
      setPecas(p || []);

      const { data: s } = await supabase.from("os_servicos").select("*").eq("os_id", id);
      setServicos(s || []);

      setLoading(false);
    }
    carregar();
  }, [id]);

  async function mudarStatus(novoStatus: string) {
    setAtualizandoStatus(true);
    const extra = novoStatus === "concluida" ? { data_conclusao: new Date().toISOString() } : {};
    await supabase.from("ordens_servico").update({ status: novoStatus, ...extra }).eq("id", id);
    setOs((o) => o ? { ...o, status: novoStatus } : o);
    setAtualizandoStatus(false);
  }

  if (loading) return <p className="text-zinc-400 text-sm">Carregando...</p>;
  if (!os) return <p className="text-zinc-400 text-sm">OS não encontrada.</p>;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-6 h-6 text-zinc-600" />
          <h1 className="text-2xl font-bold text-zinc-800">OS #{os.numero}</h1>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusCor[os.status]}`}>
            {statusLabel[os.status]}
          </span>
        </div>
        <Button variant="outline" onClick={() => router.push("/ordens-servico")}>
          Voltar
        </Button>
      </div>

      {/* Cliente e Veículo */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-zinc-400 text-xs mb-1">Cliente</p>
          <p className="font-medium text-zinc-800">{os.clientes?.nome}</p>
          <p className="text-zinc-500">{os.clientes?.telefone}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">Veículo</p>
          <p className="font-medium text-zinc-800">{os.veiculos?.placa} — {os.veiculos?.marca} {os.veiculos?.modelo}</p>
          <p className="text-zinc-500">{os.veiculos?.ano_fab} · {os.veiculos?.cor}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">KM Entrada</p>
          <p className="text-zinc-800">{os.km_entrada || "—"}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">Previsão</p>
          <p className="text-zinc-800">{os.data_previsao ? new Date(os.data_previsao).toLocaleDateString("pt-BR") : "—"}</p>
        </div>
        <div className="col-span-2">
          <p className="text-zinc-400 text-xs mb-1">Problema Relatado</p>
          <p className="text-zinc-800">{os.descricao_problema}</p>
        </div>
        {os.observacoes && (
          <div className="col-span-2">
            <p className="text-zinc-400 text-xs mb-1">Observações</p>
            <p className="text-zinc-800">{os.observacoes}</p>
          </div>
        )}
      </div>

      {/* Peças */}
      {pecas.length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
          <h2 className="font-semibold text-zinc-700 mb-3">Peças</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-400 text-xs border-b">
                <th className="text-left pb-2">Descrição</th>
                <th className="text-right pb-2">Qtd</th>
                <th className="text-right pb-2">Unit.</th>
                <th className="text-right pb-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {pecas.map((p) => (
                <tr key={p.id} className="border-b border-zinc-50">
                  <td className="py-2 text-zinc-800">{p.descricao}</td>
                  <td className="py-2 text-right text-zinc-500">{p.quantidade}</td>
                  <td className="py-2 text-right text-zinc-500">R$ {p.preco_unit.toFixed(2)}</td>
                  <td className="py-2 text-right font-medium text-zinc-800">R$ {p.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Serviços */}
      {servicos.length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
          <h2 className="font-semibold text-zinc-700 mb-3">Serviços</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-zinc-400 text-xs border-b">
                <th className="text-left pb-2">Descrição</th>
                <th className="text-right pb-2">Qtd</th>
                <th className="text-right pb-2">Unit.</th>
                <th className="text-right pb-2">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {servicos.map((s) => (
                <tr key={s.id} className="border-b border-zinc-50">
                  <td className="py-2 text-zinc-800">{s.descricao}</td>
                  <td className="py-2 text-right text-zinc-500">{s.quantidade}</td>
                  <td className="py-2 text-right text-zinc-500">R$ {s.preco_unit.toFixed(2)}</td>
                  <td className="py-2 text-right font-medium text-zinc-800">R$ {s.subtotal.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Totais */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 text-sm space-y-2">
        <div className="flex justify-between text-zinc-600">
          <span>Total Peças</span>
          <span>R$ {os.total_pecas.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-zinc-600">
          <span>Total Serviços</span>
          <span>R$ {os.total_servicos.toFixed(2)}</span>
        </div>
        {os.desconto > 0 && (
          <div className="flex justify-between text-red-500">
            <span>Desconto</span>
            <span>- R$ {os.desconto.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-zinc-800 text-base border-t pt-2">
          <span>Total Geral</span>
          <span>R$ {os.total_geral.toFixed(2)}</span>
        </div>
      </div>

      {/* Mudar Status */}
      {os.status !== "concluida" && os.status !== "cancelada" && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
          <h2 className="font-semibold text-zinc-700 mb-3">Atualizar Status</h2>
          <div className="flex flex-wrap gap-2">
            {os.status !== "em_andamento" && (
              <Button variant="outline" disabled={atualizandoStatus} onClick={() => mudarStatus("em_andamento")}>
                Em andamento
              </Button>
            )}
            {os.status !== "aguardando_peca" && (
              <Button variant="outline" disabled={atualizandoStatus} onClick={() => mudarStatus("aguardando_peca")}>
                Aguardando peça
              </Button>
            )}
            <Button
              disabled={atualizandoStatus}
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={() => mudarStatus("concluida")}
            >
              Concluir OS
            </Button>
            <Button
              disabled={atualizandoStatus}
              variant="outline"
              className="text-red-500 border-red-200 hover:bg-red-50"
              onClick={() => mudarStatus("cancelada")}
            >
              Cancelar OS
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}