import { createClient } from "@/lib/supabase-browser";

export type Perfil = "administrador" | "recepcionista" | "mecanico" | "financeiro";

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfil: Perfil;
};

export async function getUsuarioLogado(): Promise<Usuario | null> {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", user.id)
    .single();

  return data || null;
}

export const permissoes = {
  administrador: ["dashboard", "clientes", "veiculos", "os", "financeiro", "estoque", "usuarios"],
  recepcionista: ["dashboard", "clientes", "veiculos", "os"],
  mecanico: ["dashboard", "os"],
  financeiro: ["dashboard", "financeiro"],
};

export function temPermissao(perfil: Perfil, modulo: string): boolean {
  return permissoes[perfil]?.includes(modulo) ?? false;
}