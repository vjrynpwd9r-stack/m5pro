import { Users } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ClientesPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-zinc-600" />
          <h1 className="text-2xl font-bold text-zinc-800">Clientes</h1>
        </div>
        <Link href="/clientes/novo">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            + Novo Cliente
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-8 text-center text-zinc-400">
        <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Nenhum cliente cadastrado ainda.</p>
      </div>
    </div>
  );
}