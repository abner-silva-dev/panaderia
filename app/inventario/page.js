export default function InventarioPage() {
  return (
    <section className="w-full rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
        Inventario
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Control de inventario
      </h1>
      <p className="mt-4 max-w-2xl text-zinc-300">
        Visualiza existencias de harina, levadura, azucar y demas insumos.
      </p>
    </section>
  );
}
