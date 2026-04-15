"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../_lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [nextPath] = useState(() => {
    if (typeof window === "undefined") {
      return "/productos";
    }
    const params = new URLSearchParams(window.location.search);
    return params.get("next") || "/productos";
  });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    if (!email || !password || loading) return;

    setLoading(true);
    setErrorMessage("");
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    router.push(nextPath);
    router.refresh();
  };

  const handleSignup = async () => {
    if (!email || !password || loading) return;

    setLoading(true);
    setErrorMessage("");
    setMessage("");

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Cuenta creada. Si tienes confirmación por correo, revisa tu email.");
    setLoading(false);
  };

  return (
    <section className="mx-auto w-full max-w-lg rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
        Acceso
      </p>
      <h1 className="mt-3 text-3xl font-bold text-white">Iniciar sesión</h1>
      <p className="mt-3 text-sm text-zinc-300">
        Ingresa con un usuario autenticado para agregar o actualizar productos.
      </p>

      {errorMessage ? (
        <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          {errorMessage}
        </p>
      ) : null}

      {message ? (
        <p className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-200">
          {message}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4">
        <input
          type="email"
          placeholder="Correo"
          className="rounded-xl bg-zinc-800 p-3 text-white outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="rounded-xl bg-zinc-800 p-3 text-white outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={handleLogin}
          disabled={loading}
          className="rounded-xl bg-amber-400 px-4 py-2 font-semibold text-black hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Procesando..." : "Entrar"}
        </button>
        <button
          onClick={handleSignup}
          disabled={loading}
          className="rounded-xl border border-zinc-700 px-4 py-2 font-semibold text-zinc-100 hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Crear usuario
        </button>
      </div>
    </section>
  );
}
