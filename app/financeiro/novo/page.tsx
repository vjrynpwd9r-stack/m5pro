"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export default function NovoLancamentoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    tipo: "receita",
    categoria: "",
    descricao: "",
    valor: "",
    data_vencimento: "",
    data_pagamento: "",
    status: "pendente",
    forma_pagamento: "",
    banco_conta: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("financeiro_lancamentos").insert([{
      ...form,
      valor: parseFloat(form.valor),
    }]);
    setLoading(false);
    if (error) {
      alert("Erro ao salvar lançamento: " + error.message);
    } else {
      router.push("/financeiro");
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-800 mb-6">Novo Lançamento</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">

          <div>
            <Label htmlFor="tipo">Tipo *</Label>
            <select
              id="tipo"
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm"
            >
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>

          <div>
            <Label htmlFor="status">Status *</Label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm"
            >
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div className="col-span-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input id="descricao" name="descricao" value={form.descricao} onChange={handleChange} required />
          </div>

          <div>
            <Label htmlFor="categoria">Categoria</Label>
            <Input id="categoria" name="categoria" value={form.categoria} onChange={handleChange} placeholder="Ex: Peças, Aluguel..." />
          </div>

          <div>
            <Label htmlFor="valor">Valor *</Label>
            <Input id="valor" name="valor" value={form.valor} onChange={handleChange} type="number" step="0.01" required />
          </div>

          <div>
            <Label htmlFor="data_vencimento">Vencimento *</Label>
            <Input id="data_vencimento" name="data_vencimento" value={form.data_vencimento} onChange={handleChange} type="date" required />
          </div>

          <div>
            <Label htmlFor="data_pagamento">Data Pagamento</Label>
            <Input id="data_pagamento" name="data_pagamento" value={form.data_pagamento} onChange={handleChange} type="date" />
          </div>

          <div>
            <Label htmlFor="forma_pagamento">Forma de Pagamento</Label>
            <select
              id="forma_pagamento"
              name="forma_pagamento"
              value={form.forma_pagamento}
              onChange={handleChange}
              className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Selecione...</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="pix">PIX</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="cartao_debito">Cartão de Débito</option>
              <option value="transferencia">Transferência</option>
              <option value="boleto">Boleto</option>
            </select>
          </div>

          <div>
            <Label htmlFor="banco_conta">Banco / Conta</Label>
            <Input id="banco_conta" name="banco_conta" value={form.banco_conta} onChange={handleChange} placeholder="Ex: Itaú Conta Corrente" />
          </div>

        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white">
            {loading ? "Salvando..." : "Salvar Lançamento"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/financeiro")}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}