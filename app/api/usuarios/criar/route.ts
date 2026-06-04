import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const { nome, email, senha, perfil } = await request.json();

  // Cliente com service role para criar usuários
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Cria o usuário no Auth
  const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
  });

  if (authError || !authUser.user) {
    return NextResponse.json({ erro: authError?.message || "Erro ao criar usuário" });
  }

  // Insere na tabela usuarios
  const { error: dbError } = await supabaseAdmin.from("usuarios").insert([{
    id: authUser.user.id,
    nome,
    email,
    perfil,
  }]);

  if (dbError) {
    return NextResponse.json({ erro: dbError.message });
  }

  return NextResponse.json({ sucesso: true });
}