"use client";

import { useState } from "react";
import { Navigation } from "./Navigation";
import { AuthButton } from "./AuthButton";

export const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-400">
          Panaderia App
        </p>

        {/* Desktop */}
        <div className="hidden items-center gap-3 md:flex">
          <Navigation />
          <AuthButton />
        </div>

        {/* Mobile button */}
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center justify-center rounded-lg p-2 text-zinc-200 hover:bg-zinc-800 md:hidden"
        >
          {/* Icono hamburguesa */}
          <span className="text-xl">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-zinc-800 bg-zinc-900 px-4 pb-4">
          <div className="flex flex-col gap-2 pt-3">
            <Navigation mobile onNavigate={() => setOpen(false)} />
            <AuthButton />
          </div>
        </div>
      )}
    </header>
  );
};
