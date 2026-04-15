"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../_lib/supabase";
import { Button, IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const PRODUCTS_TABLE = "product";
const PRODUCT_IMAGE_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_PRODUCT_BUCKET || "panes";

export default function ProductosPage() {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [rowMenuAnchorEl, setRowMenuAnchorEl] = useState(null);
  const [rowMenuProduct, setRowMenuProduct] = useState(null);
  const previewObjectUrlRef = useRef(null);

  // Obtener productos
  const getProducts = async () => {
    setErrorMessage("");
    const { data, error } = await supabase.from(PRODUCTS_TABLE).select("*");

    if (!error) {
      setProducts(data);
    } else {
      console.error(error);
      setErrorMessage("No se pudieron cargar los productos.");
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkAuthAndLoad = async () => {
      const { data } = await supabase.auth.getSession();
      const hasSession = Boolean(data.session);

      if (!mounted) {
        return;
      }

      setIsAuthenticated(hasSession);
      setAuthChecked(true);

      if (!hasSession) {
        router.push("/login?next=/productos");
        return;
      }

      await getProducts();
    };

    checkAuthAndLoad();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const hasSession = Boolean(session);
        setIsAuthenticated(hasSession);
        if (!hasSession) {
          setProducts([]);
        }
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    return () => {
      if (previewObjectUrlRef.current) {
        URL.revokeObjectURL(previewObjectUrlRef.current);
      }
    };
  }, []);

  const uploadProductImage = async (file) => {
    const safeFileName = file.name
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9._-]/g, "");
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}-${safeFileName || "image.jpg"}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(PRODUCT_IMAGE_BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const clearForm = () => {
    setName("");
    setPrice("");
    setImageFile(null);
    setImagePreview("");
    setCurrentImageUrl("");
    setEditingId(null);
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }

    const objectUrl = URL.createObjectURL(file);
    previewObjectUrlRef.current = objectUrl;
    setImageFile(file);
    setImagePreview(objectUrl);
  };

  // Crear o actualizar
  const handleSubmit = async () => {
    if (!isAuthenticated) {
      router.push("/login?next=/productos");
      return;
    }

    if (!name || !price || loading) return;

    setLoading(true);
    setErrorMessage("");

    try {
      let imageUrlToSave = currentImageUrl || null;

      if (imageFile) {
        imageUrlToSave = await uploadProductImage(imageFile);
      }

      const payload = {
        name: name.trim(),
        price: Number(price),
        image: imageUrlToSave,
      };

      const { error } = editingId
        ? await supabase
            .from(PRODUCTS_TABLE)
            .update(payload)
            .eq("id", editingId)
        : await supabase.from(PRODUCTS_TABLE).insert([payload]);

      if (error) {
        throw error;
      }

      clearForm();
      await getProducts();
    } catch (error) {
      console.error(error);
      const msg =
        error?.message ||
        "No se pudo guardar. Verifica columna image y bucket de Storage.";
      setErrorMessage(
        `${msg} (tabla: ${PRODUCTS_TABLE}, columna: image, bucket: ${PRODUCT_IMAGE_BUCKET})`,
      );
    } finally {
      setLoading(false);
    }
  };

  // Editar
  const handleEdit = (product) => {
    setName(product.name);
    setPrice(String(product.price));
    setImageFile(null);
    setCurrentImageUrl(product.image ?? "");
    setImagePreview(product.image ?? "");
    setEditingId(product.id);
    if (previewObjectUrlRef.current) {
      URL.revokeObjectURL(previewObjectUrlRef.current);
      previewObjectUrlRef.current = null;
    }
  };

  // Eliminar
  const handleDelete = async (id) => {
    if (!isAuthenticated) {
      router.push("/login?next=/productos");
      return;
    }

    setErrorMessage("");
    const { error } = await supabase.from(PRODUCTS_TABLE).delete().eq("id", id);
    if (error) {
      console.error(error);
      setErrorMessage("No se pudo eliminar el producto.");
      return;
    }
    await getProducts();
  };

  const openRowMenu = Boolean(rowMenuAnchorEl);

  if (!authChecked) {
    return (
      <section className="w-full rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-10">
        <p className="text-sm text-zinc-300">Verificando sesión...</p>
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section className="w-full rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-10">
        <h1 className="text-2xl font-bold text-white">Acceso requerido</h1>
        <p className="mt-3 text-zinc-300">
          Debes iniciar sesión para administrar productos.
        </p>
        <Link
          href="/login?next=/productos"
          className="mt-5 inline-flex rounded-xl bg-amber-400 px-4 py-2 font-semibold text-black hover:bg-amber-300"
        >
          Ir a login
        </Link>
      </section>
    );
  }

  return (
    <section className="w-full rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
        Productos
      </p>

      <h1 className="mt-3 text-3xl font-bold text-white">
        Catálogo de productos
      </h1>

      {errorMessage ? (
        <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
          {errorMessage}
        </p>
      ) : null}

      {/* FORM */}
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <input
          placeholder="Nombre"
          className="rounded-xl bg-zinc-800 p-3 text-white outline-none w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          placeholder="Precio"
          type="number"
          className="rounded-xl bg-zinc-800 p-3 text-white outline-none w-full"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          className="rounded-xl bg-zinc-800 p-3 text-sm text-zinc-100 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-700 file:px-3 file:py-1 file:text-zinc-100 w-full"
          onChange={handleImageChange}
        />

        <Button
          onClick={handleSubmit}
          disabled={loading}
          variant="contained"
          color="primary"
          className="rounded-xl bg-amber-400 font-semibold text-black hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60 w-full"
        >
          {loading ? "Guardando..." : editingId ? "Actualizar" : "Agregar"}
        </Button>
      </div>

      {imagePreview ? (
        <div className="mt-4 flex items-center gap-3">
          <Image
            src={imagePreview}
            alt="Vista previa"
            width={72}
            height={72}
            unoptimized
            className="h-[72px] w-[72px] rounded-xl border border-zinc-700 object-cover"
          />
          {editingId ? (
            <button
              onClick={() => {
                setImageFile(null);
                setCurrentImageUrl("");
                setImagePreview("");
                if (previewObjectUrlRef.current) {
                  URL.revokeObjectURL(previewObjectUrlRef.current);
                  previewObjectUrlRef.current = null;
                }
              }}
              className="rounded-lg bg-zinc-700 px-3 py-2 text-sm text-white hover:bg-zinc-600"
            >
              Quitar imagen
            </button>
          ) : null}
        </div>
      ) : null}

      {/* TABLA */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-left text-white">
          <thead>
            <tr className="border-b border-zinc-700 text-zinc-400">
              <th className="p-3">Imagen</th>
              <th className="p-3">Nombre</th>
              <th className="p-3">Precio</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr
                key={product.id}
                className="border-b border-zinc-800 hover:bg-zinc-800/40"
              >
                <td className="p-3">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={56}
                      height={56}
                      className="h-14 w-14 rounded-lg border border-zinc-700 object-cover"
                    />
                  ) : (
                    <span className="text-xs text-zinc-500">Sin imagen</span>
                  )}
                </td>
                <td className="p-3">{product.name}</td>
                <td className="p-3">${product.price}</td>

                <td className="p-3 text-right">
                  <IconButton
                    aria-label={`acciones-${product.id}`}
                    onClick={(event) => {
                      setRowMenuAnchorEl(event.currentTarget);
                      setRowMenuProduct(product);
                    }}
                    size="small"
                    sx={{ color: "#fff" }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Menu
          anchorEl={rowMenuAnchorEl}
          open={openRowMenu}
          onClose={() => {
            setRowMenuAnchorEl(null);
            setRowMenuProduct(null);
          }}
        >
          <MenuItem
            onClick={() => {
              if (rowMenuProduct) {
                handleEdit(rowMenuProduct);
              }
              setRowMenuAnchorEl(null);
              setRowMenuProduct(null);
            }}
          >
            Editar
          </MenuItem>
          <MenuItem
            onClick={async () => {
              if (rowMenuProduct) {
                await handleDelete(rowMenuProduct.id);
              }
              setRowMenuAnchorEl(null);
              setRowMenuProduct(null);
            }}
            disabled
          >
            Eliminar
          </MenuItem>
        </Menu>
      </div>
    </section>
  );
}
