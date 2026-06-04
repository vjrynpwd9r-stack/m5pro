"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Users } from "lucide-react";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfil: string;
  ativo: boolean;
  criado_em: string;
};

const perfilLabel: Record<string, string> = {
  administrador: "Administrador",
  recepcionista: "Recepcionista",
  mecanico: "Mecânico",
  financeiro: "Financeiro",
};

const perfilCor: Record<string, string> = {
  administrador: "bg-red-100 text-red-700",
  recepcionista: "bg-blue-100 text-blue-700",
  mecanico: "bg-yellow-100 text-yellow-700",
  financeiro: "bg-green-100 text-green-700",
};

export default function UsuarioDetalhe() {
  const router = useRouter();
  const { id } = useParams();
  const { usuario: usuarioLogado } = useAuth();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    perfil: "",
    ativo: true,
  });

  useEffect(() => {
    if (usuarioLogado && usuarioLogado.perfil !== "administrador") {
      router.push("/");
      return;
    }

    async function carregar() {
      const { data } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", id)
        .single();
      setUsuario(data);
      setForm({
        nome: data?.nome || "",
        perfil: data?.perfil || "mecanico",
        ativo: data?.ativo ?? true,
      });
      setLoading(false);
    }
    carregar();
  }, [id, usuarioLogado]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const value = e.target.type === "checkbox"
      ? (e.target as HTMLInputElement).checked
      : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  }

  async function salvar() {
    setSalvando(true);
    const { error } = await supabase
      .from("usuarios")
      .update(form)
      .eq("id", id);
    setSalvando(false);
    if (error) {
      alert("Erro ao salvar: " + error.message);
    } else {
      setEditando(false);
      const { data } = await supabase.from("usuarios").select("*").eq("id", id).single();
      setUsuario(data);
    }
  }

  if (loading) return <p className="text-zinc-400 text-sm">Carregando...</p>;
  if (!usuario) return <p className="text-zinc-400 text-sm">Usuário não encontrado.</p>;

  return (
    <div className="max-w-md space-y-6">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-zinc-600" />
          <h1 className="text-2xl font-bold text-zinc-800">{usuario.nome}</h1>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${perfilCor[usuario.perfil]}`}>
            {perfilLabel[usuario.perfil]}
          </span>
        </div>
        <div className="flex gap-2">
          {!editando ? (
            <>
              <Button onClick={() => setEditando(true)} variant="outline">Editar</Button>
              <Button variant="outline" onClick={() => router.push("/usuarios")}>Voltar</Button>
            </>
          ) : (
            <>
              <Button onClick={salvar} disabled={salvando} className="bg-orange-500 hover:bg-orange-600 text-white">
                {salvando ? "Salvando..." : "Salvar"}
              </Button>
              <Button variant="outline" onClick={() => setEditando(false)}>Cancelar</Button>
            </>
          )}
        </div>
      </div>

      {/* Dados */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-4 text-sm">
        {editando ? (
          <>
            <div>
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" value={form.nome} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="perfil">Perfil</Label>
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
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="ativo"
                name="ativo"
                checked={form.ativo}
                onChange={handleChange}
                className="w-4 h-4"
              />
              <Label htmlFor="ativo">Usuário ativo</Label>
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-zinc-400 text-xs mb-1">E-mail</p>
              <p className="text-zinc-800">{usuario.email}</p>
            </div>
            <div>
              <p className="text-zinc-400 text-xs mb-1">Perfil</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${perfilCor[usuario.perfil]}`}>
                {perfilLabel[usuario.perfil]}
              </span>
            </div>
            <div>
              <p className="text-zinc-400 text-xs mb-1">Status</p>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${usuario.ativo ? "bg-green-100 text-green-700" : "bg-zinc-100 text-zinc-500"}`}>
                {usuario.ativo ? "Ativo" : "Inativo"}
              </span>
            </div>
            <div>
              <p className="text-zinc-400 text-xs mb-1">Cadastrado em</p>
              <p className="text-zinc-800">{new Date(usuario.criado_em).toLocaleDateString("pt-BR")}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}