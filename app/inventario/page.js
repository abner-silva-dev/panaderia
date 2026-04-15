"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../_lib/supabase";
import Image from "next/image";
import { formatCurrency } from "../_utils/currency";
import { Button, Grid } from "@mui/material";

const INVENTORY_TABLE = "inventory";

export default function InventarioPage() {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);

  const [selectedProducts, setSelectedProducts] = useState({});
  const [search, setSearch] = useState("");
  const [searchModal, setSearchModal] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const router = useRouter();

  // 🔥 FILTRO MODAL
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchModal.toLowerCase()),
  );

  // 🔥 GET INVENTARIO
  const getInventory = async () => {
    const { data, error } = await supabase.from(INVENTORY_TABLE).select(`
      *,
      product:product_id (
        id,
        name,
        price,
        image
      )
    `);

    if (!error) setInventory(data);
    else setErrorMessage("Error cargando inventario");
  };

  // 🔥 GET PRODUCTOS
  const getProducts = async () => {
    const { data, error } = await supabase.from("product").select("*");

    if (!error) setProducts(data);
  };

  // 🔥 ABRIR MODAL
  const openModal = async () => {
    await getProducts();
    setShowModal(true);
  };

  // 🔥 SELECCIONAR PRODUCTO (SIN VALOR POR DEFECTO)
  const handleSelectProduct = (productId) => {
    setSelectedProducts((prev) => {
      const copy = { ...prev };

      if (copy[productId] !== undefined) {
        delete copy[productId];
      } else {
        copy[productId] = ""; // 👈 vacío
      }

      return copy;
    });
  };

  // 🔥 CAMBIAR CANTIDAD
  const handleQuantityChange = (productId, value) => {
    setSelectedProducts((prev) => ({
      ...prev,
      [productId]: value,
    }));
  };

  // 🔥 GUARDAR INVENTARIO
  const handleSaveInventory = async () => {
    try {
      const { data: currentInventory } = await supabase
        .from("inventory")
        .select("*");

      const inventoryMap = new Map();
      currentInventory.forEach((item) => {
        inventoryMap.set(item.product_id, item);
      });

      const updates = [];
      const inserts = [];

      Object.entries(selectedProducts).forEach(([productId, quantity]) => {
        const parsedQuantity = Number(quantity);

        if (!parsedQuantity || parsedQuantity <= 0) return;

        const existing = inventoryMap.get(Number(productId));

        if (existing) {
          updates.push({
            id: existing.id,
            quantity: existing.quantity + parsedQuantity,
          });
        } else {
          inserts.push({
            product_id: Number(productId),
            quantity: parsedQuantity,
          });
        }
      });

      // updates
      for (const item of updates) {
        await supabase
          .from("inventory")
          .update({ quantity: item.quantity })
          .eq("id", item.id);
      }

      // inserts
      if (inserts.length > 0) {
        await supabase.from("inventory").insert(inserts);
      }

      setShowModal(false);
      setSelectedProducts({});
      await getInventory();
    } catch (error) {
      console.error(error);
      setErrorMessage("Error guardando inventario");
    }
  };

  // 🔐 AUTH
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const hasSession = Boolean(data.session);

      setIsAuthenticated(hasSession);
      setAuthChecked(true);

      if (!hasSession) {
        router.push("/login");
        return;
      }

      await getInventory();
    };

    init();
  }, [router]);

  // 🔍 FILTRO TABLA
  const filteredInventory = inventory.filter((item) =>
    item.product?.name?.toLowerCase().includes(search.toLowerCase()),
  );

  if (!authChecked) return <p className="text-white">Cargando...</p>;
  if (!isAuthenticated) return null;

  return (
    <section className="w-full rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
        Inventario
      </p>

      <h1 className="mt-3 text-3xl font-bold text-white mb-10">
        Gestion de inventario
      </h1>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 9 }}>
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 w-full p-2 rounded bg-zinc-800"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 3 }}>
          <Button onClick={openModal} fullWidth variant="contained">
            Generar inventario
          </Button>
        </Grid>
      </Grid>

      {/* TABLA */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-white">
          <thead>
            <tr className="border-b border-zinc-700 text-zinc-400">
              <th className="p-3">Img</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Precio</th>
              <th className="p-3 text-right">Cantidad</th>
            </tr>
          </thead>

          <tbody>
            {filteredInventory.map((item) => (
              <tr key={item.id} className="border-b border-zinc-800">
                <td className="p-3">
                  {item.product?.image && (
                    <Image
                      src={item.product.image}
                      width={50}
                      height={50}
                      alt=""
                      className="h-14 w-14 rounded-lg object-cover"
                    />
                  )}
                </td>

                <td className="p-3">{item.product?.name}</td>
                <td className="p-3">{formatCurrency(item.product?.price)}</td>
                <td className="p-3 text-right">{item.quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-zinc-800 p-4">
              <h2 className="text-lg font-semibold text-white">
                Generar inventario
              </h2>

              <button onClick={() => setShowModal(false)}>✕</button>
            </div>

            {/* BUSCADOR */}
            <div className="p-4 border-b border-zinc-800">
              <input
                type="text"
                placeholder="Buscar producto..."
                value={searchModal}
                onChange={(e) => setSearchModal(e.target.value)}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-3 py-2 text-white"
              />
            </div>

            {/* LISTA */}
            <div className="max-h-[55vh] overflow-y-auto p-4 space-y-3">
              {filteredProducts.map((product) => {
                const isSelected = selectedProducts[product.id];

                return (
                  <div
                    key={product.id}
                    className="grid grid-cols-[40px_1fr_120px] items-center gap-3 rounded-xl border border-zinc-800 p-3"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected !== undefined}
                      onChange={() => handleSelectProduct(product.id)}
                      className="h-5 w-5 accent-amber-400"
                    />

                    <div>
                      <p>{product.name}</p>
                      <span className="text-xs text-zinc-400">
                        {formatCurrency(product.price)}
                      </span>
                    </div>

                    <input
                      type="number"
                      min="1"
                      disabled={isSelected === undefined}
                      value={isSelected ?? ""}
                      onChange={(e) =>
                        handleQuantityChange(product.id, e.target.value)
                      }
                      placeholder="Cant."
                      className="w-full rounded-lg bg-zinc-800 px-2 py-1 text-center"
                    />
                  </div>
                );
              })}
            </div>

            {/* FOOTER */}
            <div className="flex justify-end gap-3 p-4 border-t border-zinc-800">
              <button onClick={() => setShowModal(false)}>Cancelar</button>

              <button
                onClick={handleSaveInventory}
                className="bg-amber-400 px-4 py-2 rounded text-black"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
