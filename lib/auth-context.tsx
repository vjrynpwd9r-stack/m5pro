"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Usuario, getUsuarioLogado } from "@/lib/auth";
import { createClient } from "@/lib/supabase-browser";

type AuthContextType = {
  usuario: Usuario | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  loading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function carregar() {
      const u = await getUsuarioLogado();
      setUsuario(u);
      setLoading(false);
    }

    carregar();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      carregar();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}