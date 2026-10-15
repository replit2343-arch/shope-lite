import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronDown,
  Coins,
  HelpCircle,
  MessageSquareText,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Ticket,
} from "lucide-react";
import { photos, productTitle } from "@/components/product/product-data";
import { formatRM, DEFAULT_PRODUCT_PRICE } from "@/lib/currency";
import { useProducts } from "@/lib/shop-store";

export const Route = createFileRoute("/keranjang")({
  head: () => ({
    meta: [
      { title: "Keranjang Belanja | Kingz Sparepart Computer" },
      {
        name: "description",
        content:
          "Keranjang belanja Kingz Sparepart Computer. Atur jumlah produk dan lanjutkan checkout.",
      },
      { property: "og:title", content: "Keranjang Belanja | Kingz Sparepart Computer" },
      { property: "og:description", content: "Lihat dan atur produk di keranjang belanja Anda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CartPage,
});

const PRICE = DEFAULT_PRODUCT_PRICE;
const rp = (n: number) => formatRM(n);

function Box({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <input
      type="checkbox"
      aria-label={label}
      checked={checked}
      onChange={onChange}
      className="h-[18px] w-[18px] shrink-0 cursor-pointer accent-primary"
    />
  );
}

function CartPage() {
  const products = useProducts();
  const product = products[0];
  const itemTitle = product?.name || productTitle;
  const itemPrice = product?.price || PRICE;
  const itemImage = product?.images?.[0] || photos[0];

  const [qty, setQty] = useState(1);
  const [checked, setChecked] = useState(true);
  const [inCart, setInCart] = useState(true);

  const total = checked && inCart ? itemPrice * qty : 0;
  const toggle = () => setChecked((c) => !c);

  if (!inCart) {
    return (
      <main className="min-h-screen bg-muted/50 px-4 py-8 sm:px-6 md:py-12">
        <div className="mx-auto max-w-[800px] rounded-lg bg-card p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <h1 className="text-lg font-semibold sm:text-xl">Keranjang Belanja Kosong</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Belum ada produk di keranjang belanjaan Anda. Yuk, temukan sparepart komputer terbaik
            sekarang!
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-sm bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition hover:opacity-90"
            >
              <ShoppingCart className="h-4 w-4" />
              Mulai Belanja
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/50 px-2 py-4 sm:px-4 md:py-6">
      <div className="mx-auto max-w-[1200px] space-y-3 pb-36 md:pb-6">
        <Link to="/" className="inline-block text-sm text-primary hover:underline">
          ← Kembali ke produk
        </Link>

        {/* Header (desktop) */}
        <div className="hidden grid-cols-[40px_minmax(0,1fr)_140px_140px_120px_140px] items-center rounded-sm bg-card px-5 py-4 text-sm text-muted-foreground shadow-sm md:grid">
          <Box checked={checked} onChange={toggle} label="Pilih semua" />
          <span className="text-foreground">Produk</span>
          <span className="text-center">Harga Satuan</span>
          <span className="text-center">Kuantitas</span>
          <span className="text-center">Total Harga</span>
          <span className="text-center">Aksi</span>
        </div>

        {/* Store block */}
        <section className="rounded-sm bg-card shadow-sm">
          <div className="flex items-center gap-3 border-b px-3 py-4 sm:px-5">
            <Box checked={checked} onChange={toggle} label="Pilih toko" />
            <span className="rounded-sm bg-primary px-1 text-xs font-semibold text-primary-foreground">
              Star+
            </span>
            <span className="truncate text-sm font-medium">Kingz Sparepart Computer</span>
            <MessageSquareText className="h-4 w-4 shrink-0 text-primary" />
          </div>

          <div className="grid grid-cols-[24px_minmax(0,1fr)] gap-3 border-b px-3 py-5 sm:px-5 md:grid-cols-[40px_minmax(0,1fr)_140px_140px_120px_140px] md:items-center md:gap-0">
            <div className="pt-2 md:pt-0">
              <Box checked={checked} onChange={toggle} label="Pilih produk" />
            </div>
            <div className="flex min-w-0 gap-3">
              <img
                src={itemImage}
                alt={itemTitle}
                className="h-20 w-20 shrink-0 border object-cover rounded-sm"
              />
              <div className="min-w-0 flex-1 md:pr-4">
                <p className="line-clamp-2 text-sm font-medium">{itemTitle}</p>
                <div className="mt-1 flex flex-wrap gap-1 text-[10px] font-bold">
                  <span className="rounded-sm bg-primary/10 px-1 text-primary">GRATIS ONGKIR</span>
                  <span className="rounded-sm bg-accent/10 px-1 text-accent-foreground">
                    PROMO XTRA
                  </span>
                  <span className="rounded-sm bg-secondary/10 px-1 text-secondary-foreground">
                    CICILAN 0%
                  </span>
                </div>
                {/* Mobile details */}
                <div className="mt-2 md:hidden">
                  <p className="text-sm font-semibold text-primary">{rp(itemPrice)}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <Qty qty={qty} setQty={setQty} />
                    <button
                      onClick={() => setInCart(false)}
                      className="text-sm font-medium text-muted-foreground hover:text-destructive"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <span className="hidden text-center text-sm md:block">{rp(itemPrice)}</span>
            <div className="hidden justify-center md:flex">
              <Qty qty={qty} setQty={setQty} />
            </div>
            <span className="hidden text-center text-sm font-medium text-primary md:block">
              {rp(itemPrice * qty)}
            </span>
            <div className="hidden flex-col items-center gap-1 text-sm md:flex">
              <button
                onClick={() => setInCart(false)}
                className="font-medium text-muted-foreground hover:text-destructive transition"
              >
                Hapus
              </button>
              <button className="flex items-center text-primary hover:underline">
                Produk Serupa
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button className="flex items-center gap-3 px-3 py-4 text-sm text-primary hover:underline sm:px-5">
            <Ticket className="h-4 w-4 text-primary" />
            Tambahkan kode Voucher Toko
          </button>
        </section>

        {/* Summary */}
        <section className="fixed inset-x-0 bottom-0 z-30 rounded-t-lg bg-card text-sm shadow-[0_-4px_16px_rgba(0,0,0,0.08)] border-t md:sticky md:mt-6 md:rounded-sm">
          <div className="flex items-center justify-between gap-3 border-b border-dashed px-3 py-3 sm:px-5 md:justify-end md:gap-16">
            <span className="flex items-center gap-2 font-medium sm:text-base">
              <Ticket className="h-5 w-5 text-primary" />
              Voucher Shopee
            </span>
            <button className="text-primary font-medium hover:underline">
              Gunakan/masukkan kode
            </button>
          </div>
          <div className="flex items-center justify-end gap-3 border-b border-dashed px-3 py-3 text-muted-foreground sm:px-5">
            <input type="checkbox" disabled className="h-4 w-4" aria-label="Gunakan koin" />
            <span className="flex items-center gap-1 opacity-60">
              <Coins className="h-4 w-4" />
              Koin Shopee
            </span>
            <span className="flex items-center gap-1 text-foreground/80">
              Saldo Koin Tidak Cukup
              <HelpCircle className="h-3 w-3" />
            </span>
            <span className="ml-auto opacity-60 md:ml-12">-RM 0.00</span>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 sm:px-5 md:flex md:justify-between">
            <div className="flex min-w-0 items-center gap-3 md:gap-6">
              <Box checked={checked} onChange={toggle} label="Pilih semua" />
              <span className="truncate font-medium">
                Pilih Semua<span className="hidden sm:inline"> ({checked ? 1 : 0})</span>
              </span>
              <button
                onClick={() => setInCart(false)}
                className="hidden text-muted-foreground hover:text-destructive md:inline"
              >
                Hapus
              </button>
              <button className="hidden text-center text-primary md:inline md:max-w-[120px] lg:max-w-none hover:underline">
                Tambahkan ke Favorit
              </button>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="text-right">
                <span className="hidden sm:inline text-muted-foreground">
                  Total ({checked ? 1 : 0} produk):{" "}
                </span>
                <span className="block text-xs text-muted-foreground sm:hidden">Total</span>
                <span className="text-base font-bold text-primary sm:text-2xl">{rp(total)}</span>
              </div>
              <Link
                to="/pembayaran"
                onClick={() => {
                  try {
                    localStorage.setItem(
                      "kingz_checkout",
                      JSON.stringify({
                        productId: product?.id || 1,
                        name: itemTitle,
                        price: itemPrice,
                        quantity: qty,
                        image: itemImage,
                      }),
                    );
                  } catch {
                    // ignore
                  }
                }}
                className={
                  checked && total > 0
                    ? "rounded-sm bg-primary px-6 py-3 font-medium text-primary-foreground shadow transition hover:opacity-90 sm:px-16"
                    : "pointer-events-none rounded-sm bg-primary px-6 py-3 font-medium text-primary-foreground opacity-50 sm:px-16"
                }
              >
                Checkout
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function Qty({ qty, setQty }: { qty: number; setQty: (n: number) => void }) {
  return (
    <div className="flex h-8 items-center border rounded-sm">
      <button
        aria-label="Kurangi"
        onClick={() => setQty(Math.max(1, qty - 1))}
        className="grid h-full w-8 place-items-center border-r bg-muted/30 hover:bg-muted transition"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-12 text-center text-sm font-medium">{qty}</span>
      <button
        aria-label="Tambah"
        onClick={() => setQty(qty + 1)}
        className="grid h-full w-8 place-items-center border-l bg-muted/30 hover:bg-muted transition"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
