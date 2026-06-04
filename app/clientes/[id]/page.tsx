"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { Users, Car, ClipboardList } from "lucide-react";

type Cliente = {
  id: string;
  nome: string;
  tipo: string;
  cpf_cnpj: string;
  telefone: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  observacoes: string;
  ativo: boolean;
  criado_em: string;
};

type Veiculo = {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano_fab: number;
  cor: string;
};

type OS = {
  id: string;
  numero: number;
  status: string;
  data_entrada: string;
  total_geral: number;
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

export default function ClienteDetalhe() {
  const router = useRouter();
  const { id } = useParams();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [ordens, setOrdens] = useState<OS[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const { data: c } = await supabase
        .from("clientes")
        .select("*")
        .eq("id", id)
        .single();
      setCliente(c);

      const { data: v } = await supabase
        .from("veiculos")
        .select("id, placa, marca, modelo, ano_fab, cor")
        .eq("cliente_id", id);
      setVeiculos(v || []);

      const { data: o } = await supabase
        .from("ordens_servico")
        .select("id, numero, status, data_entrada, total_geral, veiculos(placa, modelo)")
        .eq("cliente_id", id)
        .order("numero", { ascending: false });
      setOrdens((o as unknown as OS[]) || []);

      setLoading(false);
    }
    carregar();
  }, [id]);

  if (loading) return <p className="text-zinc-400 text-sm">Carregando...</p>;
  if (!cliente) return <p className="text-zinc-400 text-sm">Cliente não encontrado.</p>;

  return (
    <div className="max-w-3xl space-y-6">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-zinc-600" />
          <h1 className="text-2xl font-bold text-zinc-800">{cliente.nome}</h1>
          <span className="text-xs px-2 py-1 rounded-full bg-zinc-100 text-zinc-500">
            {cliente.tipo === "PF" ? "Pessoa Física" : "Pessoa Jurídica"}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push(`/clientes/${id}/editar`)}>
            Editar
          </Button>
          <Button variant="outline" onClick={() => router.push("/clientes")}>
            Voltar
          </Button>
        </div>
      </div>

      {/* Dados do cliente */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-zinc-400 text-xs mb-1">CPF / CNPJ</p>
          <p className="text-zinc-800">{cliente.cpf_cnpj || "—"}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">Telefone</p>
          <p className="text-zinc-800">{cliente.telefone || "—"}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">E-mail</p>
          <p className="text-zinc-800">{cliente.email || "—"}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">Cliente desde</p>
          <p className="text-zinc-800">{new Date(cliente.criado_em).toLocaleDateString("pt-BR")}</p>
        </div>
        {(cliente.logradouro || cliente.cidade) && (
          <div className="col-span-2">
            <p className="text-zinc-400 text-xs mb-1">Endereço</p>
            <p className="text-zinc-800">
              {[cliente.logradouro, cliente.numero, cliente.complemento].filter(Boolean).join(", ")}
              {cliente.bairro && ` — ${cliente.bairro}`}
              {cliente.cidade && ` · ${cliente.cidade}/${cliente.estado}`}
              {cliente.cep && ` · CEP ${cliente.cep}`}
            </p>
          </div>
        )}
        {cliente.observacoes && (
          <div className="col-span-2">
            <p className="text-zinc-400 text-xs mb-1">Observações</p>
            <p className="text-zinc-800">{cliente.observacoes}</p>
          </div>
        )}
      </div>

      {/* Veículos */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-zinc-500" />
            <h2 className="font-semibold text-zinc-700">Veículos ({veiculos.length})</h2>
          </div>
          <Button
            variant="outline"
            className="text-sm"
            onClick={() => router.push("/veiculos/novo")}
          >
            + Novo veículo
          </Button>
        </div>
        {veiculos.length === 0 ? (
          <p className="text-sm text-zinc-400">Nenhum veículo cadastrado.</p>
        ) : (
          <div className="space-y-2">
            {veiculos.map((v) => (
              <div
                key={v.id}
                onClick={() => router.push(`/veiculos/${v.id}`)}
                className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors"
              >
                <div>
                  <span className="font-mono font-bold text-zinc-800">{v.placa}</span>
                  <span className="text-zinc-500 ml-2">{v.marca} {v.modelo}</span>
                </div>
                <span className="text-zinc-400 text-sm">{v.ano_fab} · {v.cor}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ordens de Serviço */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-4 h-4 text-zinc-500" />
          <h2 className="font-semibold text-zinc-700">Ordens de Serviço ({ordens.length})</h2>
        </div>
        {ordens.length === 0 ? (
          <p className="text-sm text-zinc-400">Nenhuma OS registrada.</p>
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
                  <span className="text-zinc-500 text-sm">{os.veiculos?.placa} — {os.veiculos?.modelo}</span>
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