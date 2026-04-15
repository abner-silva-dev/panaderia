"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../_lib/supabase";

export const AuthButton = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const syncSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setIsAuthenticated(Boolean(data.session));
      setLoading(false);
    };

    syncSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(Boolean(session));
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <span className="hidden rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400 md:inline-flex">
        ...
      </span>
    );
  }

  if (isAuthenticated) {
    return (
      <button
        onClick={handleLogout}
        className="hidden rounded-full border border-zinc-700 px-3 py-1 text-xs font-semibold text-zinc-200 transition-colors hover:border-zinc-600 hover:bg-zinc-800 md:inline-flex"
      >
        Salir
      </button>
    );
  }

  if (pathname === "/login") {
    return null;
  }

  return (
    <Link
      href="/login"
      className="hidden rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 transition-colors hover:bg-amber-500/20 md:inline-flex"
    >
      Login
    </Link>
  );
};
