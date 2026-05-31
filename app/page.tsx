import { Users, Car, ClipboardList, DollarSign } from "lucide-react";

const cards = [
  { label: "Clientes", value: "0", icon: Users, cor: "text-blue-500" },
  { label: "Veículos", value: "0", icon: Car, cor: "text-green-500" },
  { label: "OS Abertas", value: "0", icon: ClipboardList, cor: "text-orange-500" },
  { label: "A Receber", value: "R$ 0,00", icon: DollarSign, cor: "text-emerald-500" },
];

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-zinc-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl p-6 shadow-sm border border-zinc-200"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-zinc-500">{card.label}</span>
                <Icon className={`w-5 h-5 ${card.cor}`} />
              </div>
              <p className="text-2xl font-bold text-zinc-800">{card.value}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}