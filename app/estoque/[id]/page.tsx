"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Package } from "lucide-react";

type Peca = {
  id: string;
  codigo: string;
  descricao: string;
  unidade: string;
  preco_custo: number;
  preco_venda: number;
  estoque_atual: number;
  estoque_minimo: number;
  ativo: boolean;
  criado_em: string;
};

export default function PecaDetalhe() {
  const router = useRouter();
  const { id } = useParams();
  const [peca, setPeca] = useState<Peca | null>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    codigo: "",
    descricao: "",
    unidade: "",
    preco_custo: "",
    preco_venda: "",
    estoque_atual: "",
    estoque_minimo: "",
  });

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase
        .from("pecas")
        .select("*")
        .eq("id", id)
        .single();
      setPeca(data);
      setForm({
        codigo: data?.codigo || "",
        descricao: data?.descricao || "",
        unidade: data?.unidade || "UN",
        preco_custo: data?.preco_custo?.toString() || "",
        preco_venda: data?.preco_venda?.toString() || "",
        estoque_atual: data?.estoque_atual?.toString() || "0",
        estoque_minimo: data?.estoque_minimo?.toString() || "0",
      });
      setLoading(false);
    }
    carregar();
  }, [id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function salvar() {
    setSalvando(true);
    const { error } = await supabase.from("pecas").update({
      ...form,
      preco_custo: form.preco_custo ? parseFloat(form.preco_custo) : null,
      preco_venda: form.preco_venda ? parseFloat(form.preco_venda) : null,
      estoque_atual: parseInt(form.estoque_atual),
      estoque_minimo: parseInt(form.estoque_minimo),
    }).eq("id", id);
    setSalvando(false);
    if (error) {
      alert("Erro ao salvar: " + error.message);
    } else {
      setEditando(false);
      const { data } = await supabase.from("pecas").select("*").eq("id", id).single();
      setPeca(data);
    }
  }

  if (loading) return <p className="text-zinc-400 text-sm">Carregando...</p>;
  if (!peca) return <p className="text-zinc-400 text-sm">Peça não encontrada.</p>;

  return (
    <div className="max-w-2xl space-y-6">

      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Package className="w-6 h-6 text-zinc-600" />
          <h1 className="text-2xl font-bold text-zinc-800">{peca.descricao}</h1>
          {peca.estoque_atual <= peca.estoque_minimo && (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
              Estoque baixo
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {!editando ? (
            <>
              <Button onClick={() => setEditando(true)} variant="outline">Editar</Button>
              <Button variant="outline" onClick={() => router.push("/estoque")}>Voltar</Button>
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
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6">
        <div className="grid grid-cols-2 gap-4 text-sm">

          {editando ? (
            <>
              <div>
                <Label htmlFor="codigo">Código</Label>
                <Input id="codigo" name="codigo" value={form.codigo} onChange={handleChange} />
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
                <Label htmlFor="descricao">Descrição</Label>
                <Input id="descricao" name="descricao" value={form.descricao} onChange={handleChange} />
              </div>
              <div>
                <Label htmlFor="preco_custo">Preço de Custo</Label>
                <Input id="preco_custo" name="preco_custo" value={form.preco_custo} onChange={handleChange} type="number" step="0.01" />
              </div>
              <div>
                <Label htmlFor="preco_venda">Preço de Venda</Label>
                <Input id="preco_venda" name="preco_venda" value={form.preco_venda} onChange={handleChange} type="number" step="0.01" />
              </div>
              <div>
                <Label htmlFor="estoque_atual">Estoque Atual</Label>
                <Input id="estoque_atual" name="estoque_atual" value={form.estoque_atual} onChange={handleChange} type="number" />
              </div>
              <div>
                <Label htmlFor="estoque_minimo">Estoque Mínimo</Label>
                <Input id="estoque_minimo" name="estoque_minimo" value={form.estoque_minimo} onChange={handleChange} type="number" />
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-zinc-400 text-xs mb-1">Código</p>
                <p className="text-zinc-800 font-mono">{peca.codigo || "—"}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-xs mb-1">Unidade</p>
                <p className="text-zinc-800">{peca.unidade}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-xs mb-1">Preço de Custo</p>
                <p className="text-zinc-800">{peca.preco_custo ? `R$ ${peca.preco_custo.toFixed(2)}` : "—"}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-xs mb-1">Preço de Venda</p>
                <p className="text-zinc-800 font-medium">{peca.preco_venda ? `R$ ${peca.preco_venda.toFixed(2)}` : "—"}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-xs mb-1">Estoque Atual</p>
                <p className={`text-xl font-bold ${peca.estoque_atual <= peca.estoque_minimo ? "text-orange-600" : "text-zinc-800"}`}>
                  {peca.estoque_atual} {peca.unidade}
                </p>
              </div>
              <div>
                <p className="text-zinc-400 text-xs mb-1">Estoque Mínimo</p>
                <p className="text-zinc-800">{peca.estoque_minimo} {peca.unidade}</p>
              </div>
              <div>
                <p className="text-zinc-400 text-xs mb-1">Cadastrado em</p>
                <p className="text-zinc-800">{new Date(peca.criado_em).toLocaleDateString("pt-BR")}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}