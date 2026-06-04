"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

type Cliente = { id: string; nome: string };

export default function EditarVeiculoPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState({
    cliente_id: "",
    placa: "",
    marca: "",
    modelo: "",
    ano_fab: "",
    ano_modelo: "",
    cor: "",
    chassi: "",
    renavam: "",
    combustivel: "",
    km_atual: "",
    observacoes: "",
  });

  useEffect(() => {
    async function carregar() {
      const { data: c } = await supabase.from("clientes").select("id, nome").order("nome");
      setClientes(c || []);

      const { data: v } = await supabase.from("veiculos").select("*").eq("id", id).single();
      if (v) {
        setForm({
          cliente_id: v.cliente_id || "",
          placa: v.placa || "",
          marca: v.marca || "",
          modelo: v.modelo || "",
          ano_fab: v.ano_fab?.toString() || "",
          ano_modelo: v.ano_modelo?.toString() || "",
          cor: v.cor || "",
          chassi: v.chassi || "",
          renavam: v.renavam || "",
          combustivel: v.combustivel || "",
          km_atual: v.km_atual?.toString() || "",
          observacoes: v.observacoes || "",
        });
      }
      setLoading(false);
    }
    carregar();
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    const { error } = await supabase.from("veiculos").update({
      ...form,
      placa: form.placa.toUpperCase(),
      ano_fab: form.ano_fab ? parseInt(form.ano_fab) : null,
      ano_modelo: form.ano_modelo ? parseInt(form.ano_modelo) : null,
      km_atual: form.km_atual ? parseInt(form.km_atual) : null,
    }).eq("id", id);
    setSalvando(false);
    if (error) {
      alert("Erro ao salvar: " + error.message);
    } else {
      router.push(`/veiculos/${id}`);
    }
  }

  if (loading) return <p className="text-zinc-400 text-sm">Carregando...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-800 mb-6">Editar Veículo</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">
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
            <Label htmlFor="placa">Placa *</Label>
            <Input
              id="placa"
              name="placa"
              value={form.placa}
              onChange={handleChange}
              className="uppercase"
              required
            />
          </div>

          <div>
            <Label htmlFor="marca">Marca</Label>
            <Input id="marca" name="marca" value={form.marca} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="modelo">Modelo</Label>
            <Input id="modelo" name="modelo" value={form.modelo} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="ano_fab">Ano Fabricação</Label>
            <Input id="ano_fab" name="ano_fab" value={form.ano_fab} onChange={handleChange} type="number" />
          </div>

          <div>
            <Label htmlFor="ano_modelo">Ano Modelo</Label>
            <Input id="ano_modelo" name="ano_modelo" value={form.ano_modelo} onChange={handleChange} type="number" />
          </div>

          <div>
            <Label htmlFor="cor">Cor</Label>
            <Input id="cor" name="cor" value={form.cor} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="combustivel">Combustível</Label>
            <Input id="combustivel" name="combustivel" value={form.combustivel} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="chassi">Chassi</Label>
            <Input id="chassi" name="chassi" value={form.chassi} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="renavam">RENAVAM</Label>
            <Input id="renavam" name="renavam" value={form.renavam} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="km_atual">KM Atual</Label>
            <Input id="km_atual" name="km_atual" value={form.km_atual} onChange={handleChange} type="number" />
          </div>

          <div className="col-span-2">
            <Label htmlFor="observacoes">Observações</Label>
            <textarea
              id="observacoes"
              name="observacoes"
              value={form.observacoes}
              onChange={handleChange}
              rows={3}
              className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm resize-none"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={salvando} className="bg-orange-500 hover:bg-orange-600 text-white">
            {salvando ? "Salvando..." : "Salvar Alterações"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push(`/veiculos/${id}`)}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}