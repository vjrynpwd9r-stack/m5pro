"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

export default function NovoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    tipo: "PF",
    cpf_cnpj: "",
    telefone: "",
    email: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
    observacoes: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function buscarCep() {
    if (form.cep.length < 8) return;
    const cep = form.cep.replace(/\D/g, "");
    const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();
    if (!data.erro) {
      setForm((f) => ({
        ...f,
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        estado: data.uf,
      }));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("clientes").insert([form]);
    setLoading(false);
    if (error) {
      alert("Erro ao salvar cliente: " + error.message);
    } else {
      router.push("/clientes");
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-800 mb-6">Novo Cliente</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input id="nome" name="nome" value={form.nome} onChange={handleChange} required />
          </div>

          <div>
            <Label htmlFor="tipo">Tipo</Label>
            <select
              id="tipo"
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm"
            >
              <option value="PF">Pessoa Física</option>
              <option value="PJ">Pessoa Jurídica</option>
            </select>
          </div>

          <div>
            <Label htmlFor="cpf_cnpj">CPF / CNPJ</Label>
            <Input id="cpf_cnpj" name="cpf_cnpj" value={form.cpf_cnpj} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="telefone">Telefone</Label>
            <Input id="telefone" name="telefone" value={form.telefone} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              name="cep"
              value={form.cep}
              onChange={handleChange}
              onBlur={buscarCep}
              placeholder="00000-000"
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="logradouro">Logradouro</Label>
            <Input id="logradouro" name="logradouro" value={form.logradouro} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="numero">Número</Label>
            <Input id="numero" name="numero" value={form.numero} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="complemento">Complemento</Label>
            <Input id="complemento" name="complemento" value={form.complemento} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="bairro">Bairro</Label>
            <Input id="bairro" name="bairro" value={form.bairro} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="cidade">Cidade</Label>
            <Input id="cidade" name="cidade" value={form.cidade} onChange={handleChange} />
          </div>

          <div>
            <Label htmlFor="estado">Estado</Label>
            <Input id="estado" name="estado" value={form.estado} onChange={handleChange} maxLength={2} />
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
          <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white">
            {loading ? "Salvando..." : "Salvar Cliente"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/clientes")}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}