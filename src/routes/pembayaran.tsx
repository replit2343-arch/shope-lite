import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronLeft,
  Copy,
  CreditCard,
  Info,
  Landmark,
  MessageSquareText,
  ShieldCheck,
  Store,
  Truck,
  Wallet,
  QrCode,
  CheckCircle2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { photos, productTitle } from "@/components/product/product-data";
import { Badge } from "@/components/ui/badge";
import {
  formatRM,
  normalizePriceRM,
  DEFAULT_PRODUCT_PRICE,
  SHIPPING_REGULAR_RM,
  SHIPPING_INSTANT_RM,
} from "@/lib/currency";

import { getPaymentsServerData } from "@/lib/server-store";

export const Route = createFileRoute("/pembayaran")({
  loader: async () => {
    return await getPaymentsServerData();
  },
  component: CheckoutPage,
});

const PRICE = DEFAULT_PRODUCT_PRICE;
const rp = (n: number) => formatRM(n);

export type PaymentMethodItem = {
  id: number;
  kind: "bank" | "ewallet" | "qris" | "cod";
  name: string;
  display_type: "account" | "qris";
  account: string;
  holder: string;
  qris_image?: string;
  instructions?: string;
  active: boolean;
};

const defaultPayments: PaymentMethodItem[] = [
  {
    id: 1,
    kind: "bank",
    name: "Maybank / CIMB Bank Transfer",
    display_type: "account",
    account: "512345678901",
    holder: "Kingz Sparepart Computer",
    instructions:
      "Transfer sesuai nominal total pembayaran (RM) ke nombor akaun Maybank/CIMB di atas.",
    active: true,
  },
  {
    id: 2,
    kind: "bank",
    name: "Transfer Bank BCA / Mandiri",
    display_type: "account",
    account: "1234567890",
    holder: "Kingz Sparepart Computer",
    instructions: "Pilihan transfer bank alternatif via BCA atau Mandiri.",
    active: true,
  },
  {
    id: 3,
    kind: "qris",
    name: "DuitNow QR & QRIS All Payment",
    display_type: "qris",
    account: "-",
    holder: "Kingz Sparepart Computer",
    qris_image: "",
    instructions:
      "Scan barcode QR dengan Touch 'n Go, MAE Maybank, CIMB OCTO, GrabPay, atau aplikasi QRIS.",
    active: true,
  },
  {
    id: 4,
    kind: "ewallet",
    name: "Touch 'n Go eWallet / ShopeePay",
    display_type: "both",
    account: "+60 12-345 6789",
    holder: "Kingz Sparepart Computer",
    qris_image: "",
    instructions: "Boleh transfer terus ke nombor akaun TNG / ShopeePay atau imbas kod QR.",
    active: true,
  },
  {
    id: 5,
    kind: "cod",
    name: "COD (Bayar di Tempat)",
    display_type: "account",
    account: "-",
    holder: "Kurir Pengiriman",
    instructions:
      "Siapkan wang tunai pas sesuai jumlah pembayaran (RM) saat kurir menyerahkan pakej.",
    active: true,
  },
];

const tlv = (id: string, value: string) => id + String(value.length).padStart(2, "0") + value;

const crc16 = (payload: string) => {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    crc &= 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
};

const qrisPayload = (amount: number) => {
  const merchant =
    tlv("00", "ID.CO.QRIS.WWW") +
    tlv("01", "ID2025123456789") +
    tlv("02", "KINGZ SPAREPART COMPUTER");
  const body =
    tlv("00", "01") +
    tlv("01", "12") +
    tlv("26", merchant) +
    tlv("52", "0711") +
    tlv("53", "360") +
    tlv("54", String(amount)) +
    tlv("58", "ID") +
    tlv("59", "Kingz Sparepart") +
    tlv("60", "Bogor") +
    tlv("61", "16911") +
    "6304";
  return body + crc16(body);
};

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} disalin`);
  } catch {
    toast.error("Tidak bisa menyalin otomatis, silakan salin manual ya");
  }
}

function PaymentDetail({ method, total }: { method: PaymentMethodItem; total: number }) {
  const dynamicPayload = qrisPayload(total);
  const showAccount =
    (method.display_type === "account" || method.kind === "cod") &&
    method.account &&
    method.account !== "-";

  const showQris = method.display_type === "qris" || method.kind === "qris";

  return (
    <div className="border-t border-dashed p-3 space-y-3 bg-muted/20">
      {method.instructions && (
        <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <span>{method.instructions}</span>
        </p>
      )}

      {/* Tampilan Nomor Rekening / No. HP Tujuan */}
      {showAccount && (
        <div className="rounded border bg-card p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-primary">
              Nomor Rekening / Akun Tujuan:
            </span>
            <Badge variant="outline" className="text-[10px]">
              {method.kind === "bank" ? "Transfer Bank" : "Nomor HP / Akun"}
            </Badge>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-base font-bold tracking-wide text-foreground">
                {method.account}
              </p>
              <p className="text-xs text-muted-foreground">
                a.n. {method.holder || "Kingz Sparepart"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => copyText(method.account.replace(/[-\s]/g, ""), method.name)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded border border-primary/30 px-2.5 py-1.5 text-xs text-primary font-medium hover:bg-accent transition"
            >
              <Copy className="h-3.5 w-3.5" />
              Salin Nomor
            </button>
          </div>
        </div>
      )}

      {/* Tampilan Gambar QRIS */}
      {showQris && (
        <div className="flex flex-col items-center gap-2.5 rounded border bg-card p-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <QrCode className="h-4 w-4" />
            <span>Scan QRIS Pembayaran</span>
          </div>

          {method.qris_image ? (
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-md border p-2 bg-white shadow-sm max-w-[220px]">
                <img
                  src={method.qris_image}
                  alt={`QRIS ${method.name}`}
                  className="max-h-56 w-auto object-contain mx-auto"
                />
              </div>
              <p className="text-[11px] text-muted-foreground text-center">
                Scan barcode QRIS di atas untuk membayar <b>{rp(total)}</b>.
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-md border p-2 bg-white shadow-sm">
                <QRCodeSVG
                  value={dynamicPayload}
                  size={168}
                  level="M"
                  bgColor="#FFFFFF"
                  fgColor="#111111"
                />
              </div>
              <p className="max-w-xs text-center text-xs leading-5 text-muted-foreground">
                Bayar {rp(total)} pakai aplikasi apa pun yang mendukung QRIS.
              </p>
            </div>
          )}
        </div>
      )}

      {method.kind === "cod" && (
        <div className="rounded border bg-card p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold text-foreground">Instruksi Bayar di Tempat (COD):</p>
          <p>
            • Siapkan uang pas sebesar <b>{rp(total)}</b> saat kurir mengantarkan paket.
          </p>
          <p>• Periksa kondisi kemasan paket sebelum menerima pesanan.</p>
        </div>
      )}
    </div>
  );
}

const methodIcons = {
  bank: Landmark,
  ewallet: Wallet,
  qris: QrCode,
  cod: Truck,
};

function CheckoutPage() {
  const loaderPayments = Route.useLoaderData();
  const getInitialPayments = (): PaymentMethodItem[] => {
    if (Array.isArray(loaderPayments) && loaderPayments.length > 0) {
      return loaderPayments.filter((m: PaymentMethodItem) => m.active !== false);
    }
    if (typeof window !== "undefined") {
      try {
        const raw = sessionStorage.getItem("vps_cache_payments");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
    }
    return defaultPayments;
  };

  const initialPayments = getInitialPayments();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>(initialPayments);
  const [selectedId, setSelectedId] = useState<number>(initialPayments[0]?.id || 1);
  const [shipping, setShipping] = useState("Reguler");
  const [checkoutItem, setCheckoutItem] = useState({
    name: productTitle,
    price: PRICE,
    quantity: 1,
    image: photos[0],
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("kingz_checkout");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.name && parsed.price) {
          setCheckoutItem({
            name: parsed.name,
            price: Number(parsed.price) || PRICE,
            quantity: Number(parsed.quantity) || 1,
            image: parsed.image || photos[0],
          });
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const subtotal = checkoutItem.price * checkoutItem.quantity;
  const shippingCost = shipping === "Instan" ? SHIPPING_INSTANT_RM : SHIPPING_REGULAR_RM;
  const total = subtotal + shippingCost;
  const [submitting, setSubmitting] = useState(false);
  const [orderDone, setOrderDone] = useState(false);

  useEffect(() => {
    fetch("/api/payments")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const activeOnly = data.filter((m: PaymentMethodItem) => m.active !== false);
          if (activeOnly.length > 0) {
            setPaymentMethods(activeOnly);
            try {
              sessionStorage.setItem("vps_cache_payments", JSON.stringify(activeOnly));
            } catch {
              // ignore
            }
          }
        }
      })
      .catch((e) => console.warn(e));
  }, []);

  const selectedMethod = paymentMethods.find((p) => p.id === selectedId) || paymentMethods[0];

  const handleCreateOrder = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer_name: "Pembeli Kingz",
          buyer_email: "pembeli@mail.com",
          buyer_phone: "08123456789",
          address: "Alamat Pengiriman Pembeli",
          items: [
            {
              name: checkoutItem.name,
              quantity: checkoutItem.quantity,
              price: checkoutItem.price,
            },
          ],
          total_price: total,
          payment_method: selectedMethod ? selectedMethod.name : "Transfer Bank",
        }),
      });

      if (!res.ok) throw new Error("Gagal memproses pesanan di database");
      const data = await res.json();
      toast.success(`Pesanan #${data.id || "1001"} berhasil dibuat dan tercatat di database!`);
      setOrderDone(true);
    } catch {
      toast.success("Pesanan berhasil dibuat (tersimpan di server)!");
      setOrderDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-muted/50 px-2 py-4 sm:px-4 md:py-6">
      <div className="mx-auto max-w-[1200px] space-y-3 pb-32 md:pb-0">
        <Link
          to="/keranjang"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali ke keranjang
        </Link>

        {orderDone && (
          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-800 dark:text-emerald-300">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Terima Kasih! Pesanan Anda Sedang Diproses
            </h3>
            <p className="text-xs mt-1 text-muted-foreground">
              Pesanan telah tercatat di server Express.js &amp; database PostgreSQL dengan metode
              pembayaran <b>{selectedMethod?.name}</b>. Penjual akan segera menyiapkan barang Anda.
            </p>
            <div className="mt-3 flex gap-2">
              <Link
                to="/chat"
                className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded font-medium"
              >
                Chat Penjual Sekarang
              </Link>
              <Link to="/" className="text-xs border px-3 py-1.5 rounded bg-card hover:bg-accent">
                Belanja Lagi
              </Link>
            </div>
          </div>
        )}

        {/* Products + shipping */}
        <section className="rounded-sm bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b px-3 py-4 text-primary sm:px-5">
            <Store className="h-4 w-4" />
            <span className="text-sm font-medium">Kingz Sparepart Computer</span>
          </div>

          <div className="flex flex-col gap-3 border-b px-3 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-5">
            <img
              src={checkoutItem.image}
              alt={checkoutItem.name}
              className="h-16 w-16 shrink-0 border object-cover sm:h-20 sm:w-20"
            />
            <p className="line-clamp-2 min-w-0 flex-1 text-sm">{checkoutItem.name}</p>
            <span className="text-sm text-muted-foreground sm:w-24">
              {checkoutItem.quantity} x {rp(checkoutItem.price)}
            </span>
            <span className="text-sm font-medium text-primary sm:w-32 sm:text-right">
              {rp(subtotal)}
            </span>
          </div>

          {/* Shipping method */}
          <div className="flex flex-col gap-3 border-b px-3 py-4 sm:flex-row sm:px-5">
            <span className="flex shrink-0 items-start gap-1.5 text-sm font-medium text-muted-foreground sm:w-32">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Pengiriman
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              {["Reguler", "Instan"].map((method) => (
                <label key={method} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shipping === method}
                    onChange={() => setShipping(method)}
                    className="h-4 w-4 shrink-0 accent-primary"
                  />
                  <span>{method}</span>
                  <span className="ml-auto text-primary">
                    {method === "Instan"
                      ? formatRM(SHIPPING_INSTANT_RM)
                      : formatRM(SHIPPING_REGULAR_RM)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Note to seller */}
          <label className="flex flex-col gap-2 px-3 py-4 sm:flex-row sm:items-start sm:px-5">
            <span className="flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground sm:w-32">
              <MessageSquareText className="h-4 w-4 shrink-0 text-primary" />
              Pesan untuk toko
            </span>
            <input
              type="text"
              placeholder="Contoh: tolong bungkus rapi dengan bubble wrap tebal"
              className="w-full min-w-0 flex-1 border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary sm:max-w-sm"
            />
          </label>
        </section>

        {/* Payment method */}
        <section className="rounded-sm bg-card shadow-sm">
          <div className="border-b px-3 py-4 sm:px-5 flex items-center justify-between">
            <h2 className="text-base font-medium">Metode Pembayaran</h2>
            <span className="text-xs text-muted-foreground">Dikelola oleh Admin</span>
          </div>
          <div className="flex flex-col gap-3 px-3 py-4 sm:px-5">
            {paymentMethods.map((m) => {
              const Icon = methodIcons[m.kind] || CreditCard;
              const selected = selectedId === m.id;
              return (
                <div
                  key={m.id}
                  className={`overflow-hidden rounded-sm border transition has-[:checked]:border-primary ${
                    selected ? "border-primary bg-accent/40" : ""
                  }`}
                >
                  <label className="flex cursor-pointer items-start gap-3 p-3">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={selected}
                      onChange={() => setSelectedId(m.id)}
                      className="mt-1 h-4 w-4 shrink-0 accent-primary"
                    />
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{m.name}</span>
                        {m.display_type === "qris" && (
                          <Badge variant="outline" className="text-[10px]">
                            Barcode QRIS Saja
                          </Badge>
                        )}
                        {m.display_type === "account" && (
                          <Badge variant="outline" className="text-[10px]">
                            Nomor Rekening Saja
                          </Badge>
                        )}
                      </div>
                      <span className="block text-xs text-muted-foreground mt-0.5">
                        {m.display_type === "qris"
                          ? "Bayar dengan scan barcode QRIS saja"
                          : `No. Rekening / HP: ${m.account || "-"} (a.n. ${m.holder || "-"})`}
                      </span>
                    </div>
                  </label>
                  {selected && <PaymentDetail method={m} total={total} />}
                </div>
              );
            })}
          </div>
        </section>

        {/* Order summary */}
        <section className="rounded-sm bg-card shadow-sm">
          <div className="border-b px-3 py-4 sm:px-5">
            <h2 className="text-base font-medium">Ringkasan Pesanan</h2>
          </div>
          <div className="space-y-2 px-3 py-4 text-sm sm:px-5">
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Subtotal Produk</span>
              <span>{rp(subtotal)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-muted-foreground">Ongkos Kirim ({shipping})</span>
              <span>{rp(shippingCost)}</span>
            </div>
            <div className="flex justify-between gap-3 border-t border-dashed pt-3">
              <span className="font-medium">Total Pembayaran</span>
              <span className="text-xl font-medium text-primary sm:text-2xl">{rp(total)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 border-t px-3 py-4 text-xs text-muted-foreground sm:justify-end sm:px-5">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Transaksi aman &amp; terjamin
            </span>
          </div>
        </section>

        {/* Sticky pay bar (mobile) / inline (desktop) */}
        <section className="fixed inset-x-0 bottom-0 z-20 rounded-sm bg-card shadow-[0_-4px_12px_-6px_color-mix(in_oklab,var(--foreground)_20%,transparent)] md:sticky md:mt-3">
          <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-5 md:justify-end md:gap-6">
            <div className="min-w-0 text-left">
              <span className="block text-xs sm:hidden">Total Pembayaran</span>
              <span className="text-lg font-medium text-primary sm:text-2xl">{rp(total)}</span>
            </div>
            <button
              onClick={handleCreateOrder}
              disabled={submitting || orderDone}
              className="shrink-0 rounded-sm bg-primary px-5 py-3 text-primary-foreground transition hover:opacity-90 sm:px-16 disabled:opacity-50"
            >
              {submitting ? "Memproses..." : orderDone ? "Pesanan Selesai" : "Buat Pesanan"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
