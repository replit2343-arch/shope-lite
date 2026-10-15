import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ProductGallery } from "@/components/product/gallery";
import { Seller } from "@/components/product/seller";
import { ProductDetails } from "@/components/product/details";
import { ProductReviews } from "@/components/product/reviews";
import { Stars } from "@/components/product/stars";
import { photos, productTitle } from "@/components/product/product-data";
import { initStoreData, useProducts, useShop } from "@/lib/shop-store";
import { getStoreServerData } from "@/lib/server-store";
import { ProductList } from "@/components/product/product-list";
import { formatRM, normalizePriceRM, DEFAULT_PRODUCT_PRICE } from "@/lib/currency";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Adaptor Asus A19-090P2A Original | Kingz Sparepart Computer" },
      {
        name: "description",
        content:
          "Adaptor charger laptop Asus original 19V 4.74A 90W. Lihat foto produk, spesifikasi, dan penilaian di Kingz Sparepart Computer.",
      },
      {
        property: "og:title",
        content: "Adaptor Asus A19-090P2A Original | Kingz Sparepart Computer",
      },
      {
        property: "og:description",
        content: "Detail adaptor Asus original 19V 4.74A 90W, foto produk, dan penilaian pembeli.",
      },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async () => {
    const data = await getStoreServerData();
    if (data) {
      initStoreData(data);
    }
    return data;
  },
  component: Index,
});

type Panel =
  "cart" | "buy" | "chat" | "store" | "report" | "shipping" | "protection" | "media" | null;
function Index() {
  const loaderData = Route.useLoaderData();
  const storeShop = useShop();
  const storeProducts = useProducts();

  useEffect(() => {
    if (loaderData) {
      initStoreData(loaderData);
    }
  }, [loaderData]);

  const navigate = useNavigate();
  const shop = loaderData?.shop?.name ? loaderData.shop : storeShop;
  const products =
    loaderData?.products && loaderData.products.length > 0 ? loaderData.products : storeProducts;
  const reviews =
    loaderData?.testimonials && loaderData.testimonials.length > 0
      ? loaderData.testimonials
      : undefined;
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const product = products.find((p) => p.id === selectedId) ?? products[0];
  const name = product?.name ?? productTitle;
  const price = normalizePriceRM(product?.price ?? DEFAULT_PRODUCT_PRICE);
  const images = product?.images.length ? product.images : photos;
  const [quantity, setQuantity] = useState(1);
  const [panel, setPanel] = useState<Panel>(null);
  const [media, setMedia] = useState("");
  const [toast, setToast] = useState("");
  const [reason, setReason] = useState("Informasi produk tidak sesuai");

  const handleBuyNow = () => {
    try {
      const checkoutData = {
        productId: product?.id ?? 1,
        name,
        price,
        quantity,
        image: images[0] || photos[0],
      };
      localStorage.setItem("kingz_checkout", JSON.stringify(checkoutData));
    } catch {
      // ignore
    }
    navigate({ to: "/pembayaran" });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);
  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setToast("Tautan produk berhasil disalin");
    } catch {
      setToast("Tautan produk: " + window.location.href);
    }
  };
  const title =
    panel === "cart"
      ? "Keranjang Belanja"
      : panel === "buy"
        ? "Ringkasan Pesanan"
        : panel === "chat"
          ? "Chat Kingz Sparepart Computer"
          : panel === "store"
            ? "Kingz Sparepart Computer"
            : panel === "report"
              ? "Laporkan"
              : panel === "shipping"
                ? "Informasi Pengiriman"
                : panel === "protection"
                  ? "Jaminan Shopee"
                  : "Foto Ulasan";
  return (
    <main className="product-page">
      <section className="product-overview" aria-label="Produk adaptor Asus">
        <ProductGallery onShare={share} photos={images} title={name} />
        <div className="product-summary">
          <h1 className="product-title">
            <span className="star-badge">Star+</span>
            {name}
          </h1>
          <div className="rating-line">
            <a className="rating-link" href="#penilaian">
              <span className="underline underline-offset-4">5.0</span>
              <Stars gold />
            </a>
            <span className="rating-divider" />
            <a className="rating-link" href="#penilaian">
              <span className="underline underline-offset-4">10</span>
              <span className="text-muted-foreground">Penilaian</span>
            </a>
            <Button
              variant="ghost"
              className="ml-auto h-auto p-0 font-normal text-muted-foreground"
              onClick={() => setPanel("report")}
            >
              Laporkan
            </Button>
          </div>
          <div className="price-band">{formatRM(price)}</div>
          <dl>
            <div className="purchase-detail">
              <dt>Pengiriman</dt>
              <dd>
                <div className="delivery-line">
                  <Truck className="text-delivery" />
                  <span>
                    {product?.specs?.shippingGuarantee ||
                      "Garansi tiba Hari Ini, jika pesan sebelum 10:00"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 shrink-0 text-muted-foreground"
                    title="Informasi pengiriman"
                    aria-label="Informasi pengiriman"
                    onClick={() => setPanel("shipping")}
                  >
                    <ChevronRight />
                  </Button>
                </div>
                <p className="ml-7 mt-1 text-xs leading-5 text-muted-foreground">
                  {product?.specs?.lateVoucher ||
                    "Dapatkan Voucher s/d RM 5.00 jika pesanan terlambat."}
                </p>
              </dd>
            </div>
            <div className="purchase-detail">
              <dt>
                Jaminan
                <br />
                Shopee
              </dt>
              <dd>
                <div className="delivery-line">
                  <ShieldCheck className="text-primary" />
                  <span>
                    {product?.specs?.returnProtection || "Bebas Pengembalian • Proteksi Elektronik"}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 shrink-0 text-muted-foreground"
                    aria-label="Informasi jaminan"
                    title="Informasi jaminan"
                    onClick={() => setPanel("protection")}
                  >
                    <ChevronDown />
                  </Button>
                </div>
              </dd>
            </div>
            <div className="purchase-detail">
              <dt className="pt-2">Kuantitas</dt>
              <dd>
                <div className="quantity-control">
                  <Button
                    variant="ghost"
                    className="quantity-button"
                    aria-label="Kurangi kuantitas"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Minus />
                  </Button>
                  <input
                    aria-label="Kuantitas"
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(Math.max(1, Math.floor(Number(event.target.value) || 1)))
                    }
                  />
                  <Button
                    variant="ghost"
                    className="quantity-button"
                    aria-label="Tambah kuantitas"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    <Plus />
                  </Button>
                </div>
              </dd>
            </div>
          </dl>
          <div className="purchase-actions">
            <Button
              variant="commerceOutline"
              className="button"
              onClick={() => navigate({ to: "/keranjang" })}
            >
              <ShoppingCart />
              Masukkan Keranjang
            </Button>
            <Button variant="commerce" className="button" onClick={handleBuyNow}>
              Beli Sekarang
            </Button>
          </div>
        </div>
      </section>
      <Seller shop={shop} onAction={setPanel} />
      <ProductDetails product={product} />
      <ProductReviews
        reviews={reviews}
        onMedia={(url) => {
          setMedia(url);
          setPanel("media");
        }}
        onReport={() => setPanel("report")}
      />
      <ProductList
        products={products}
        activeId={product?.id}
        onSelect={(id) => {
          setSelectedId(id);
          setQuantity(1);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
      {toast && (
        <div role="status" className="feedback-toast">
          {toast}
        </div>
      )}
      <Dialog
        open={panel !== null}
        onOpenChange={(open) => {
          if (!open) setPanel(null);
        }}
      >
        <DialogContent className="max-w-[calc(100%-32px)] bg-card sm:max-w-lg">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {panel === "media"
              ? "Foto yang dibagikan pembeli."
              : panel === "cart" || panel === "buy" || panel === "chat" || panel === "report"
                ? "Pratinjau tampilan — belum terhubung ke layanan transaksi atau toko."
                : "Informasi produk dan toko."}
          </DialogDescription>
          {(panel === "cart" || panel === "buy") && (
            <>
              <div className="grid grid-cols-[80px_minmax(0,1fr)] gap-4">
                <img src={images[0]} alt={name} className="h-20 w-20 object-contain" />
                <div className="min-w-0">
                  <p className="text-sm leading-5">{name}</p>
                  <p className="mt-2 text-primary">
                    {formatRM(price)} × {quantity}
                  </p>
                </div>
              </div>
              <div className="flex justify-between border-t pt-4">
                <span>Total</span>
                <strong className="text-primary">{formatRM(price * quantity)}</strong>
              </div>
              <Button variant="commerce" onClick={() => setPanel(null)}>
                <Check />
                {panel === "cart" ? "Kembali ke Produk" : "Tutup Ringkasan"}
              </Button>
            </>
          )}
          {panel === "chat" && (
            <>
              <p className="text-sm">Kingz Sparepart Computer · Aktif 2 Jam Lalu</p>
              <textarea
                className="min-h-28 w-full resize-y rounded-sm border bg-card p-3 text-sm"
                aria-label="Pesan untuk toko"
                placeholder="Tulis pesan untuk penjual..."
              />
              <Button variant="commerce" disabled>
                Kirim Pesan
              </Button>
            </>
          )}
          {panel === "store" && (
            <>
              <p>{shop.tagline}</p>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <dt>Produk</dt>
                <dd className="text-primary">{shop.products}</dd>
                <dt>Penilaian</dt>
                <dd className="text-primary">{shop.rating}</dd>
                <dt>Persentase Chat Dibalas</dt>
                <dd className="text-primary">{shop.chatRate}</dd>
                <dt>Pengikut</dt>
                <dd className="text-primary">{shop.followers}</dd>
              </dl>
            </>
          )}
          {panel === "report" && (
            <>
              <label className="text-sm" htmlFor="report-reason">
                Alasan laporan
              </label>
              <select
                id="report-reason"
                className="h-10 w-full rounded-sm border bg-card px-3 text-sm"
                value={reason}
                onChange={(event) => setReason(event.target.value)}
              >
                <option>Informasi produk tidak sesuai</option>
                <option>Produk mencurigakan</option>
                <option>Konten tidak pantas</option>
                <option>Lainnya</option>
              </select>
              <Button variant="commerce" disabled>
                Kirim Laporan
              </Button>
            </>
          )}
          {panel === "shipping" && (
            <>
              <p className="flex items-center gap-2">
                <Truck className="text-delivery" size={20} />
                Garansi tiba Hari Ini
              </p>
              <p className="text-sm leading-6">
                Jika pesan sebelum 10:00. Dapatkan Voucher s/d RM 5.00 jika pesanan terlambat.
              </p>
              <p className="text-sm text-muted-foreground">Dikirim dari KOTA JAKARTA PUSAT.</p>
            </>
          )}
          {panel === "protection" && (
            <>
              <p className="flex items-center gap-2">
                <ShieldCheck className="text-primary" size={20} />
                Bebas Pengembalian • Proteksi Elektronik
              </p>
              <p className="text-sm">Masa Garansi: 6 Bulan</p>
              <p className="text-sm text-muted-foreground">Jenis Garansi: Garansi Supplier</p>
            </>
          )}
          {panel === "media" && (
            <img
              src={media}
              alt="Foto ulasan pembeli"
              className="mx-auto max-h-[60vh] w-full object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
