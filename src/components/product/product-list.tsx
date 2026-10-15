import { Package } from "lucide-react";
import type { Product } from "@/lib/shop-store";
import { formatRM } from "@/lib/currency";

export function ProductList({
  products,
  activeId,
  onSelect,
}: {
  products: Product[];
  activeId?: number | undefined;
  onSelect: (id: number) => void;
}) {
  if (!products.length) return null;
  return (
    <section className="content-band" aria-label="Daftar produk">
      <h2 className="section-heading">Produk Lainnya dari Toko</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {products.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={`flex flex-col overflow-hidden rounded-sm border bg-card text-left transition-shadow hover:shadow-md ${p.id === activeId ? "border-primary" : ""}`}
          >
            {p.images[0] ? (
              <img
                src={p.images[0]}
                alt={p.name}
                className="aspect-square w-full bg-muted object-contain"
                loading="lazy"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center bg-muted">
                <Package className="text-muted-foreground" />
              </div>
            )}
            <div className="flex flex-1 flex-col gap-1 p-2">
              <p className="line-clamp-2 text-xs leading-4">{p.name}</p>
              <p className="mt-auto text-sm font-medium text-primary">{formatRM(p.price)}</p>
              <p className="text-[11px] text-muted-foreground">Stok {p.stock}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
