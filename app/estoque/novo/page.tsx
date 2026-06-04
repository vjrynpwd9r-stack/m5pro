"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export default function NovaPecaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    codigo: "",
    descricao: "",
    unidade: "UN",
    preco_custo: "",
    preco_venda: "",
    estoque_atual: "0",
    estoque_minimo: "0",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("pecas").insert([{
      ...form,
      preco_custo: form.preco_custo ? parseFloat(form.preco_custo) : null,
      preco_venda: form.preco_venda ? parseFloat(form.preco_venda) : null,
      estoque_atual: parseInt(form.estoque_atual),
      estoque_minimo: parseInt(form.estoque_minimo),
    }]);
    setLoading(false);
    if (error) {
      alert("Erro ao salvar peça: " + error.message);
    } else {
      router.push("/estoque");
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-800 mb-6">Nova Peça</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">

          <div>
            <Label htmlFor="codigo">Código</Label>
            <Input id="codigo" name="codigo" value={form.codigo} onChange={handleChange} placeholder="Ex: FIL-001" />
          </div>

          <div>
            <Label htmlFor="unidade">Unidade</Label>
            <select
              id="unidade"
              name="unidade"
              value={form.unidade}
              onChange={handleChange}
              className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm"
            >
              <option value="UN">UN — Unidade</option>
              <option value="PC">PC — Peça</option>
              <option value="KG">KG — Quilograma</option>
              <option value="LT">LT — Litro</option>
              <option value="MT">MT — Metro</option>
              <option value="CX">CX — Caixa</option>
              <option value="PR">PR — Par</option>
            </select>
          </div>

          <div className="col-span-2">
            <Label htmlFor="descricao">Descrição *</Label>
            <Input id="descricao" name="descricao" value={form.descricao} onChange={handleChange} required />
          </div>

          <div>
            <Label htmlFor="preco_custo">Preço de Custo</Label>
            <Input id="preco_custo" name="preco_custo" value={form.preco_custo} onChange={handleChange} type="number" step="0.01" placeholder="0,00" />
          </div>

          <div>
            <Label htmlFor="preco_venda">Preço de Venda</Label>
            <Input id="preco_venda" name="preco_venda" value={form.preco_venda} onChange={handleChange} type="number" step="0.01" placeholder="0,00" />
          </div>

          <div>
            <Label htmlFor="estoque_atual">Estoque Atual</Label>
            <Input id="estoque_atual" name="estoque_atual" value={form.estoque_atual} onChange={handleChange} type="number" />
          </div>

          <div>
            <Label htmlFor="estoque_minimo">Estoque Mínimo</Label>
            <Input id="estoque_minimo" name="estoque_minimo" value={form.estoque_minimo} onChange={handleChange} type="number" />
          </div>

        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white">
            {loading ? "Salvando..." : "Salvar Peça"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/estoque")}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}