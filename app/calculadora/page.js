"use client";

import { useEffect, useState } from "react";
import { supabase } from "../_lib/supabase";
import Image from "next/image";
import { formatCurrency } from "../_utils/currency";

export default function CalculadoraPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");

  const [quantities, setQuantities] = useState({});
  const [cart, setCart] = useState([]);

  const [showModal, setShowModal] = useState(false);

  // 🔥 GET PRODUCTS
  useEffect(() => {
    const getProducts = async () => {
      const { data } = await supabase.from("product").select("*");
      if (data) setProducts(data);
    };

    getProducts();
  }, []);

  // 🔍 FILTRO
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()),
  );

  // 🔢 AGREGAR DIGITO
  const handleAddDigit = (productId, digit) => {
    setQuantities((prev) => {
      const current = prev[productId] || "";
      return {
        ...prev,
        [productId]: current + digit,
      };
    });
  };

  // ❌ BORRAR
  const handleDelete = (productId) => {
    setQuantities((prev) => {
      const current = prev[productId] || "";

      return {
        ...prev,
        [productId]: current.slice(0, -1), // 👈 elimina último dígito
      };
    });
  };
  // 🛒 AGREGAR AL CARRITO
  const handleAddToCart = (product) => {
    const qty = Number(quantities[product.id]);

    if (!qty || qty <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item,
        );
      }

      return [...prev, { ...product, quantity: qty }];
    });

    // limpiar
    setQuantities((prev) => ({
      ...prev,
      [product.id]: "",
    }));
  };

  // 💰 TOTAL
  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <section className="p-4 text-white">
      <h1 className="text-2xl font-bold mb-4">Calculadora</h1>

      {/* 🔍 BUSCADOR */}
      <input
        type="text"
        placeholder="Buscar producto..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full rounded-xl bg-zinc-800 p-3"
      />

      {/* 🧱 GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pb-32">
        {filteredProducts.map((product) => {
          const qty = quantities[product.id] || "";

          return (
            <div
              key={product.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 flex flex-col"
            >
              {/* IMG */}
              {product.image && (
                <Image
                  src={product.image}
                  alt={product.name}
                  width={300}
                  height={200}
                  className="rounded-xl mb-3 object-cover h-40 w-full"
                />
              )}

              {/* INFO */}
              <h3 className="font-semibold">{product.name}</h3>

              <p className="text-sm text-zinc-400">
                {formatCurrency(product.price)} x {qty || 0}
              </p>

              {/* DISPLAY */}
              <div className="mt-2 mb-2 text-center text-lg font-bold">
                {qty || "0"}
              </div>

              {/* 🔢 CALCULADORA */}
              <div className="grid grid-cols-3 gap-2 text-center text-sm mb-3">
                {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => handleAddDigit(product.id, String(n))}
                    className="rounded-lg bg-zinc-800 py-2"
                  >
                    {n}
                  </button>
                ))}

                <button
                  onClick={() => handleDelete(product.id)}
                  className="col-span-3 rounded-lg bg-red-500/80 py-2 font-semibold"
                >
                  ←
                </button>
              </div>

              {/* ➕ BOTÓN */}
              <button
                onClick={() => handleAddToCart(product)}
                className="mt-auto rounded-xl bg-amber-400 py-2 font-semibold text-black"
              >
                Agregar
              </button>
            </div>
          );
        })}
      </div>

      {/* 🧾 FOOTER */}
      <div className="fixed bottom-0 left-0 w-full bg-zinc-900 border-t border-zinc-800 p-4 flex justify-between items-center">
        <div>
          <p className="text-sm text-zinc-400">Total</p>
          <p className="font-bold text-lg">{formatCurrency(total)}</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-amber-400 px-4 py-2 rounded text-black"
        >
          Ver más
        </button>
      </div>

      {/* 🧾 MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex justify-center items-center">
          <div className="bg-zinc-900 p-6 rounded-xl w-full max-w-md">
            <h2 className="mb-4 text-lg font-semibold">Carrito</h2>

            {cart.length === 0 && (
              <p className="text-zinc-400">Sin productos</p>
            )}

            {cart.map((item) => (
              <div key={item.id} className="flex justify-between mb-2">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}

            <div className="mt-4 flex justify-between font-bold">
              <span>Total:</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full bg-amber-400 py-2 rounded text-black"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
