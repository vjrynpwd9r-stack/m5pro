"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

type Cliente = { id: string; nome: string };
type Veiculo = { id: string; placa: string; modelo: string };

export default function NovaOSPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [pecas, setPecas] = useState([{ descricao: "", quantidade: "1", preco_unit: "" }]);
  const [servicos, setServicos] = useState([{ descricao: "", quantidade: "1", preco_unit: "" }]);
  const [form, setForm] = useState({
    cliente_id: "",
    veiculo_id: "",
    km_entrada: "",
    data_previsao: "",
    descricao_problema: "",
    diagnostico: "",
    observacoes: "",
    desconto: "0",
  });

  useEffect(() => {
    async function carregar() {
      const { data: c } = await supabase.from("clientes").select("id, nome").order("nome");
      setClientes(c || []);
    }
    carregar();
  }, []);

  async function carregarVeiculos(cliente_id: string) {
    const { data } = await supabase
      .from("veiculos")
      .select("id, placa, modelo")
      .eq("cliente_id", cliente_id);
    setVeiculos(data || []);
    setForm((f) => ({ ...f, veiculo_id: "" }));
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (name === "cliente_id") carregarVeiculos(value);
  }

  function handlePeca(index: number, field: string, value: string) {
    const novas = [...pecas];
    novas[index] = { ...novas[index], [field]: value };
    setPecas(novas);
  }

  function handleServico(index: number, field: string, value: string) {
    const novos = [...servicos];
    novos[index] = { ...novos[index], [field]: value };
    setServicos(novos);
  }

  function addPeca() {
    setPecas([...pecas, { descricao: "", quantidade: "1", preco_unit: "" }]);
  }

  function addServico() {
    setServicos([...servicos, { descricao: "", quantidade: "1", preco_unit: "" }]);
  }

  function removePeca(index: number) {
    setPecas(pecas.filter((_, i) => i !== index));
  }

  function removeServico(index: number) {
    setServicos(servicos.filter((_, i) => i !== index));
  }

  const totalPecas = pecas.reduce((acc, p) => acc + (parseFloat(p.quantidade) || 0) * (parseFloat(p.preco_unit) || 0), 0);
  const totalServicos = servicos.reduce((acc, s) => acc + (parseFloat(s.quantidade) || 0) * (parseFloat(s.preco_unit) || 0), 0);
  const desconto = parseFloat(form.desconto) || 0;
  const totalGeral = totalPecas + totalServicos - desconto;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data: os, error } = await supabase
      .from("ordens_servico")
      .insert([{
        ...form,
        km_entrada: form.km_entrada ? parseInt(form.km_entrada) : null,
        desconto,
        total_pecas: totalPecas,
        total_servicos: totalServicos,
        total_geral: totalGeral,
      }])
      .select()
      .single();

    if (error || !os) {
      alert("Erro ao salvar OS: " + error?.message);
      setLoading(false);
      return;
    }

    const pecasValidas = pecas.filter((p) => p.descricao && p.preco_unit);
    if (pecasValidas.length > 0) {
      await supabase.from("os_pecas").insert(
        pecasValidas.map((p) => ({
          os_id: os.id,
          descricao: p.descricao,
          quantidade: parseFloat(p.quantidade),
          preco_unit: parseFloat(p.preco_unit),
        }))
      );
    }

    const servicosValidos = servicos.filter((s) => s.descricao && s.preco_unit);
    if (servicosValidos.length > 0) {
      await supabase.from("os_servicos").insert(
        servicosValidos.map((s) => ({
          os_id: os.id,
          descricao: s.descricao,
          quantidade: parseFloat(s.quantidade),
          preco_unit: parseFloat(s.preco_unit),
        }))
      );
    }

    setLoading(false);
    router.push("/ordens-servico");
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-zinc-800 mb-6">Nova Ordem de Serviço</h1>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Dados gerais */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
          <h2 className="font-semibold text-zinc-700 mb-4">Dados Gerais</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="cliente_id">Cliente *</Label>
              <select
                id="cliente_id"
                name="cliente_id"
                value={form.cliente_id}
                onChange={handleChange}
                required
                className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Selecione o cliente...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nome}</option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="veiculo_id">Veículo *</Label>
              <select
                id="veiculo_id"
                name="veiculo_id"
                value={form.veiculo_id}
                onChange={handleChange}
                required
                disabled={!form.cliente_id}
                className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm disabled:opacity-50"
              >
                <option value="">Selecione o veículo...</option>
                {veiculos.map((v) => (
                  <option key={v.id} value={v.id}>{v.placa} — {v.modelo}</option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="km_entrada">KM Entrada</Label>
              <Input id="km_entrada" name="km_entrada" value={form.km_entrada} onChange={handleChange} type="number" />
            </div>

            <div>
              <Label htmlFor="data_previsao">Previsão de Entrega</Label>
              <Input id="data_previsao" name="data_previsao" value={form.data_previsao} onChange={handleChange} type="date" />
            </div>

            <div className="col-span-2">
              <Label htmlFor="descricao_problema">Descrição do Problema *</Label>
              <textarea
                id="descricao_problema"
                name="descricao_problema"
                value={form.descricao_problema}
                onChange={handleChange}
                required
                rows={3}
                className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm resize-none"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="observacoes">Observações</Label>
              <textarea
                id="observacoes"
                name="observacoes"
                value={form.observacoes}
                onChange={handleChange}
                rows={2}
                className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* Peças */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
          <h2 className="font-semibold text-zinc-700 mb-4">Peças</h2>
          <div className="space-y-2">
            {pecas.map((p, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-6">
                  <Input placeholder="Descrição" value={p.descricao} onChange={(e) => handlePeca(i, "descricao", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Input placeholder="Qtd" type="number" value={p.quantidade} onChange={(e) => handlePeca(i, "quantidade", e.target.value)} />
                </div>
                <div className="col-span-3">
                  <Input placeholder="Preço unit." type="number" value={p.preco_unit} onChange={(e) => handlePeca(i, "preco_unit", e.target.value)} />
                </div>
                <div className="col-span-1 text-right">
                  <button type="button" onClick={() => removePeca(i)} className="text-red-400 hover:text-red-600 text-lg">×</button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addPeca} className="mt-3 text-sm text-orange-500 hover:text-orange-600 font-medium">
            + Adicionar peça
          </button>
          <p className="text-right text-sm font-medium text-zinc-600 mt-2">Total peças: R$ {totalPecas.toFixed(2)}</p>
        </div>

        {/* Serviços */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
          <h2 className="font-semibold text-zinc-700 mb-4">Serviços</h2>
          <div className="space-y-2">
            {servicos.map((s, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <div className="col-span-6">
                  <Input placeholder="Descrição" value={s.descricao} onChange={(e) => handleServico(i, "descricao", e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Input placeholder="Qtd" type="number" value={s.quantidade} onChange={(e) => handleServico(i, "quantidade", e.target.value)} />
                </div>
                <div className="col-span-3">
                  <Input placeholder="Preço unit." type="number" value={s.preco_unit} onChange={(e) => handleServico(i, "preco_unit", e.target.value)} />
                </div>
                <div className="col-span-1 text-right">
                  <button type="button" onClick={() => removeServico(i)} className="text-red-400 hover:text-red-600 text-lg">×</button>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={addServico} className="mt-3 text-sm text-orange-500 hover:text-orange-600 font-medium">
            + Adicionar serviço
          </button>
          <p className="text-right text-sm font-medium text-zinc-600 mt-2">Total serviços: R$ {totalServicos.toFixed(2)}</p>
        </div>

        {/* Totais */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
          <h2 className="font-semibold text-zinc-700 mb-4">Totais</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-zinc-600">
              <span>Peças</span>
              <span>R$ {totalPecas.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-zinc-600">
              <span>Serviços</span>
              <span>R$ {totalServicos.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-zinc-600">
              <span>Desconto</span>
              <Input
                name="desconto"
                value={form.desconto}
                onChange={handleChange}
                type="number"
                className="w-32 text-right"
              />
            </div>
            <div className="flex justify-between font-bold text-zinc-800 text-base border-t pt-2">
              <span>Total Geral</span>
              <span>R$ {totalGeral.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white">
            {loading ? "Salvando..." : "Salvar OS"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/ordens-servico")}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}