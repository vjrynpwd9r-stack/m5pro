"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Car, ClipboardList, DollarSign, Package, TrendingUp } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [dados, setDados] = useState({
    totalClientes: 0,
    totalVeiculos: 0,
    osAbertas: 0,
    osEmAndamento: 0,
    aReceber: 0,
    pecasAbaixoMinimo: 0,
    receitasMes: 0,
    despesasMes: 0,
  });
  const [osRecentes, setOsRecentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1).toISOString();

      const [
        { count: totalClientes },
        { count: totalVeiculos },
        { count: osAbertas },
        { count: osEmAndamento },
        { data: pendentes },
        { data: pecas },
        { data: receitas },
        { data: despesas },
        { data: osRecentes },
      ] = await Promise.all([
        supabase.from("clientes").select("*", { count: "exact", head: true }).eq("ativo", true),
        supabase.from("veiculos").select("*", { count: "exact", head: true }),
        supabase.from("ordens_servico").select("*", { count: "exact", head: true }).eq("status", "aberta"),
        supabase.from("ordens_servico").select("*", { count: "exact", head: true }).eq("status", "em_andamento"),
        supabase.from("financeiro_lancamentos").select("valor").eq("status", "pendente").eq("tipo", "receita"),
        supabase.from("pecas").select("estoque_atual, estoque_minimo"),
        supabase.from("financeiro_lancamentos").select("valor").eq("tipo", "receita").eq("status", "pago").gte("criado_em", inicioMes),
        supabase.from("financeiro_lancamentos").select("valor").eq("tipo", "despesa").eq("status", "pago").gte("criado_em", inicioMes),
        supabase.from("ordens_servico").select("id, numero, status, data_entrada, total_geral, clientes(nome), veiculos(placa, modelo)").order("numero", { ascending: false }).limit(5),
      ]);

      const aReceber = (pendentes || []).reduce((acc: number, l: any) => acc + l.valor, 0);
      const pecasAbaixoMinimo = (pecas || []).filter((p: any) => p.estoque_atual <= p.estoque_minimo).length;
      const receitasMes = (receitas || []).reduce((acc: number, l: any) => acc + l.valor, 0);
      const despesasMes = (despesas || []).reduce((acc: number, l: any) => acc + l.valor, 0);

      setDados({
        totalClientes: totalClientes || 0,
        totalVeiculos: totalVeiculos || 0,
        osAbertas: osAbertas || 0,
        osEmAndamento: osEmAndamento || 0,
        aReceber,
        pecasAbaixoMinimo,
        receitasMes,
        despesasMes,
      });

      setOsRecentes((osRecentes as any[]) || []);
      setLoading(false);
    }
    carregar();
  }, []);

  const statusCor: Record<string, string> = {
    aberta: "bg-blue-100 text-blue-700",
    em_andamento: "bg-yellow-100 text-yellow-700",
    aguardando_peca: "bg-orange-100 text-orange-700",
    concluida: "bg-green-100 text-green-700",
    cancelada: "bg-red-100 text-red-700",
  };

  const statusLabel: Record<string, string> = {
    aberta: "Aberta",
    em_andamento: "Em andamento",
    aguardando_peca: "Aguardando peça",
    concluida: "Concluída",
    cancelada: "Cancelada",
  };

  if (loading) return <p className="text-zinc-400 text-sm">Carregando...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-zinc-800">Dashboard</h1>

      {/* Cards principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => router.push("/clientes")}
          className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-400">Clientes</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-zinc-800">{dados.totalClientes}</p>
        </div>

        <div
          onClick={() => router.push("/veiculos")}
          className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-400">Veículos</span>
            <Car className="w-4 h-4 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-zinc-800">{dados.totalVeiculos}</p>
        </div>

        <div
          onClick={() => router.push("/ordens-servico")}
          className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-400">OS Abertas</span>
            <ClipboardList className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-zinc-800">{dados.osAbertas}</p>
          {dados.osEmAndamento > 0 && (
            <p className="text-xs text-yellow-600 mt-1">{dados.osEmAndamento} em andamento</p>
          )}
        </div>

        <div
          onClick={() => router.push("/financeiro")}
          className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 cursor-pointer hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-zinc-400">A Receber</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-bold text-emerald-600">R$ {dados.aReceber.toFixed(2)}</p>
        </div>
      </div>

      {/* Resumo financeiro do mês */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-zinc-500" />
            <h2 className="font-semibold text-zinc-700">Resumo do Mês</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Receitas pagas</span>
              <span className="font-medium text-green-600">R$ {dados.receitasMes.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500">Despesas pagas</span>
              <span className="font-medium text-red-500">R$ {dados.despesasMes.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm border-t pt-2">
              <span className="font-medium text-zinc-700">Saldo</span>
              <span className={`font-bold ${dados.receitasMes - dados.despesasMes >= 0 ? "text-green-600" : "text-red-500"}`}>
                R$ {(dados.receitasMes - dados.despesasMes).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Alertas */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-zinc-500" />
            <h2 className="font-semibold text-zinc-700">Alertas</h2>
          </div>
          <div className="space-y-2">
            {dados.pecasAbaixoMinimo > 0 ? (
              <div
                onClick={() => router.push("/estoque")}
                className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors"
              >
                <span className="text-orange-500 text-lg">⚠️</span>
                <p className="text-sm text-orange-700">
                  <span className="font-medium">{dados.pecasAbaixoMinimo} peça(s)</span> abaixo do estoque mínimo
                </p>
              </div>
            ) : (
              <p className="text-sm text-zinc-400">Nenhum alerta no momento.</p>
            )}
          </div>
        </div>

        {/* OS em andamento */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-4 h-4 text-zinc-500" />
            <h2 className="font-semibold text-zinc-700">Em Andamento</h2>
          </div>
          {dados.osEmAndamento === 0 ? (
            <p className="text-sm text-zinc-400">Nenhuma OS em andamento.</p>
          ) : (
            <p
              onClick={() => router.push("/ordens-servico")}
              className="text-sm text-orange-500 font-medium cursor-pointer hover:underline"
            >
              Ver {dados.osEmAndamento} OS em andamento →
            </p>
          )}
        </div>
      </div>

      {/* OS Recentes */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="font-semibold text-zinc-700">Últimas Ordens de Serviço</h2>
          <button
            onClick={() => router.push("/ordens-servico")}
            className="text-sm text-orange-500 hover:underline"
          >
            Ver todas →
          </button>
        </div>
        {osRecentes.length === 0 ? (
          <p className="p-6 text-sm text-zinc-400">Nenhuma OS registrada ainda.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">OS</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Cliente</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Veículo</th>
                <th className="text-left px-4 py-3 font-medium text-zinc-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-zinc-600">Total</th>
              </tr>
            </thead>
            <tbody>
              {osRecentes.map((os: any) => (
                <tr
                  key={os.id}
                  onClick={() => router.push(`/ordens-servico/${os.id}`)}
                  className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-bold text-zinc-800">#{os.numero}</td>
                  <td className="px-4 py-3 text-zinc-800">{os.clientes?.nome}</td>
                  <td className="px-4 py-3 text-zinc-500">{os.veiculos?.placa} — {os.veiculos?.modelo}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCor[os.status]}`}>
                      {statusLabel[os.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-zinc-800">
                    R$ {os.total_geral?.toFixed(2) || "0.00"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}