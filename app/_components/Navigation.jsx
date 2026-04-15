"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/calculadora", label: "Calculadora" },
  { href: "/productos", label: "Productos" },
  { href: "/inventario", label: "Inventario" },
  { href: "/ventas", label: "Ventas" },
];

const baseLinkClass =
  "rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200";

export const Navigation = ({ mobile = false, onNavigate }) => {
  const pathname = usePathname();

  return (
    <nav
      className={
        mobile ? "flex flex-col gap-2" : "hidden items-center gap-2 md:flex"
      }
    >
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`${baseLinkClass} ${
              isActive
                ? "bg-amber-500 text-zinc-950"
                : "text-zinc-200 hover:bg-zinc-800 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
