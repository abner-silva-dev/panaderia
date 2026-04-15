"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/productos", label: "Productos" },
  { href: "/inventario", label: "Inventario" },
  { href: "/ventas", label: "Ventas" },
];

const baseLinkClass =
  "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200";

export const Navigation = () => {
  const pathname = usePathname();

  return (
    <>
      <nav
        className="hidden items-center gap-2 md:flex"
        aria-label="Principal desktop"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
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

      <nav
        className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-900 px-3 py-2 md:hidden"
        aria-label="Principal mobile"
      >
        <ul className="mx-auto grid max-w-md grid-cols-4 gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex justify-center rounded-xl px-2 py-2 text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-amber-500 text-zinc-950"
                      : "text-zinc-200 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};
