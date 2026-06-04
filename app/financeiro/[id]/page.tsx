"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { DollarSign } from "lucide-react";

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
  banco_conta: string;
  conciliado: boolean;
  criado_em: string;
  os_id: string;
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

const formaPagamentoLabel: Record<string, string> = {
  dinheiro: "Dinheiro",
  pix: "PIX",
  cartao_credito: "Cartão de Crédito",
  cartao_debito: "Cartão de Débito",
  transferencia: "Transferência",
  boleto: "Boleto",
};

export default function LancamentoDetalhe() {
  const router = useRouter();
  const { id } = useParams();
  const [lancamento, setLancamento] = useState<Lancamento | null>(null);
  const [loading, setLoading] = useState(true);
  const [atualizando, setAtualizando] = useState(false);

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("financeiro_lancamentos")
        .select("*")
        .eq("id", id)
        .single();
      setLancamento(data);
      setLoading(false);
    }
    carregar();
  }, [id]);

  async function marcarComoPago() {
    setAtualizando(true);
    await supabase
      .from("financeiro_lancamentos")
      .update({ status: "pago", data_pagamento: new Date().toISOString().split("T")[0] })
      .eq("id", id);
    setLancamento((l) => l ? { ...l, status: "pago", data_pagamento: new Date().toISOString().split("T")[0] } : l);
    setAtualizando(false);
  }

  async function cancelar() {
    if (!confirm("Deseja cancelar este lançamento?")) return;
    setAtualizando(true);
    await supabase.from("financeiro_lancamentos").update({ status: "cancelado" }).eq("id", id);
    setLancamento((l) => l ? { ...l, status: "cancelado" } : l);
    setAtualizando(false);
  }

  if (loading) return <p className="text-zinc-400 text-sm">Carregando...</p>;
  if (!lancamento) return <p className="text-zinc-400 text-sm">Lançamento não encontrado.</p>;

  return (
    <div className="max-w-2xl space-y-6">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-zinc-600" />
          <h1 className="text-2xl font-bold text-zinc-800">{lancamento.descricao}</h1>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusCor[lancamento.status]}`}>
            {statusLabel[lancamento.status]}
          </span>
        </div>
        <Button variant="outline" onClick={() => router.push("/financeiro")}>
          Voltar
        </Button>
      </div>

      {/* Dados */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-zinc-400 text-xs mb-1">Tipo</p>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
            lancamento.tipo === "receita" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
          }`}>
            {lancamento.tipo === "receita" ? "Receita" : "Despesa"}
          </span>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">Valor</p>
          <p className={`text-xl font-bold ${lancamento.tipo === "receita" ? "text-green-600" : "text-red-500"}`}>
            R$ {lancamento.valor.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">Categoria</p>
          <p className="text-zinc-800">{lancamento.categoria || "—"}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">Forma de Pagamento</p>
          <p className="text-zinc-800">{formaPagamentoLabel[lancamento.forma_pagamento] || "—"}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">Vencimento</p>
          <p className="text-zinc-800">{new Date(lancamento.data_vencimento + "T12:00:00").toLocaleDateString("pt-BR")}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">Data Pagamento</p>
          <p className="text-zinc-800">
            {lancamento.data_pagamento
              ? new Date(lancamento.data_pagamento + "T12:00:00").toLocaleDateString("pt-BR")
              : "—"}
          </p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">Banco / Conta</p>
          <p className="text-zinc-800">{lancamento.banco_conta || "—"}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">Conciliado</p>
          <p className="text-zinc-800">{lancamento.conciliado ? "Sim" : "Não"}</p>
        </div>
        <div>
          <p className="text-zinc-400 text-xs mb-1">Criado em</p>
          <p className="text-zinc-800">{new Date(lancamento.criado_em).toLocaleDateString("pt-BR")}</p>
        </div>
        {lancamento.os_id && (
          <div>
            <p className="text-zinc-400 text-xs mb-1">Ordem de Serviço</p>
            <p
              className="text-orange-500 font-medium cursor-pointer hover:underline"
              onClick={() => router.push(`/ordens-servico/${lancamento.os_id}`)}
            >
              Ver OS
            </p>
          </div>
        )}
      </div>

      {/* Ações */}
      {lancamento.status === "pendente" && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
          <h2 className="font-semibold text-zinc-700 mb-3">Ações</h2>
          <div className="flex gap-2">
            <Button
              disabled={atualizando}
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={marcarComoPago}
            >
              Marcar como Pago
            </Button>
            <Button
              disabled={atualizando}
              variant="outline"
              className="text-red-500 border-red-200 hover:bg-red-50"
              onClick={cancelar}
            >
              Cancelar Lançamento
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}