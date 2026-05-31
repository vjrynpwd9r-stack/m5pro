import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { placa: string } }
) {
  const placa = params.placa.toUpperCase();

  try {
    const res = await fetch(
      `https://wdapi2.com.br/consulta/${placa}/sua_chave`,
      { next: { revalidate: 86400 } }
    );

    if (!res.ok) {
      return NextResponse.json({ erro: true, mensagem: "Placa não encontrada" });
    }

    const data = await res.json();
    return NextResponse.json({
      marca: data.MARCA,
      modelo: data.MODELO,
      ano: data.ano,
      anoModelo: data.anoModelo,
      cor: data.cor,
      chassi: data.chassi,
      renavam: data.renavam,
      combustivel: data.combustivel,
    });
  } catch {
    return NextResponse.json({ erro: true, mensagem: "Erro na consulta" });
  }
}