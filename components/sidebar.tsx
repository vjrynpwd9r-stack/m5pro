"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Car,
  ClipboardList,
  DollarSign,
  Package,
  Wrench,
  LayoutDashboard,
} from "lucide-react";

const menu = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Clientes", href: "/clientes", icon: Users },
  { label: "Veículos", href: "/veiculos", icon: Car },
  { label: "Ordens de Serviço", href: "/ordens-servico", icon: ClipboardList },
  { label: "Financeiro", href: "/financeiro", icon: DollarSign },
  { label: "Estoque", href: "/estoque", icon: Package },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-zinc-900 text-white flex flex-col">
      <div className="p-6 border-b border-zinc-700">
        <div className="flex items-center gap-2">
          <Wrench className="w-6 h-6 text-orange-400" />
          <span className="text-xl font-bold tracking-tight">M5Pro</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-orange-500 text-white"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-zinc-700 text-xs text-zinc-500">
        M5Pro v1.0
      </div>
    </aside>
  );
}