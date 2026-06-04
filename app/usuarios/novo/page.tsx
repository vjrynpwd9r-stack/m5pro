"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/auth-context";

export default function NovoUsuarioPage() {
  const router = useRouter();
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
    perfil: "mecanico",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (usuario?.perfil !== "administrador") {
      alert("Acesso negado.");
      return;
    }

    setLoading(true);

    // Cria o usuário no Supabase Auth via API route
    const res = await fetch("/api/usuarios/criar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (data.erro) {
      alert("Erro ao criar usuário: " + data.erro);
    } else {
      router.push("/usuarios");
    }
  }

  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold text-zinc-800 mb-6">Novo Usuário</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4">

        <div>
          <Label htmlFor="nome">Nome *</Label>
          <Input id="nome" name="nome" value={form.nome} onChange={handleChange} required />
        </div>

        <div>
          <Label htmlFor="email">E-mail *</Label>
          <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>

        <div>
          <Label htmlFor="senha">Senha *</Label>
          <Input id="senha" name="senha" type="password" value={form.senha} onChange={handleChange} required minLength={6} />
        </div>

        <div>
          <Label htmlFor="perfil">Perfil *</Label>
          <select
            id="perfil"
            name="perfil"
            value={form.perfil}
            onChange={handleChange}
            className="w-full border border-zinc-200 rounded-md px-3 py-2 text-sm"
          >
            <option value="administrador">Administrador</option>
            <option value="recepcionista">Recepcionista</option>
            <option value="mecanico">Mecânico</option>
            <option value="financeiro">Financeiro</option>
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading} className="bg-orange-500 hover:bg-orange-600 text-white">
            {loading ? "Criando..." : "Criar Usuário"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/usuarios")}>
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  );
}