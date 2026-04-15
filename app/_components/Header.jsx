import { Navigation } from "./Navigation";
import { AuthButton } from "./AuthButton";

export const Header = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-900/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-400">
          Panaderia App
        </p>
        <div className="flex items-center gap-3">
          <Navigation />
          <AuthButton />
        </div>
      </div>
    </header>
  );
};
