import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
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
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { photos, productTitle } from '@/components/product/product-data';

export const Route = createFileRoute('/pembayaran')({
  head: () => ({
    meta: [
      { title: 'Pembayaran | Kingz Sparepart Computer' },
      { name: 'description', content: 'Halaman pembayaran dan checkout pesanan Kingz Sparepart Computer.' },
      { property: 'og:title', content: 'Pembayaran | Kingz Sparepart Computer' },
      { property: 'og:description', content: 'Pilih pengiriman dan metode pembayaran pesanan Anda.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary' },
    ],
  }),
  component: CheckoutPage,
});

const PRICE = 199000;
const rp = (n: number) => 'Rp' + n.toLocaleString('id-ID');

type Account = { name: string; number: string };
type Payment = {
  id: string;
  label: string;
  desc: string;
  icon: typeof Wallet;
  hint: string;
  accounts?: Account[];
  qris?: boolean;
};

const PAYMENTS: Payment[] = [
  {
    id: 'cod',
    label: 'COD (Bayar di Tempat)',
    desc: 'Bayar saat pesanan tiba di alamat Anda',
    icon: Wallet,
    hint: 'Siapkan uang tunai pas sesuai total pembayaran saat kurir menyerahkan paket. Metode ini tidak memiliki nomor rekening.',
  },
  {
    id: 'transfer',
    label: 'Transfer Bank',
    desc: 'BCA, BNI, BRI, Mandiri, CIMB Niaga',
    icon: Landmark,
    hint: 'Transfer ke salah satu rekening di bawah, a.n. Kingz Sparepart Computer.',
    accounts: [
      { name: 'BCA', number: '1234567890' },
      { name: 'BNI', number: '0987654321' },
      { name: 'BRI', number: '1122334455' },
      { name: 'Mandiri', number: '5566778899' },
      { name: 'CIMB Niaga', number: '4433221100' },
    ],
    qris: true,
  },
  {
    id: 'ewallet',
    label: 'E-Wallet',
    desc: 'ShopeePay, OVO, GoPay, DANA',
    icon: CreditCard,
    hint: 'Kirim ke nomor e-wallet terdaftar a.n. Kingz Sparepart Computer.',
    accounts: [
      { name: 'ShopeePay', number: '0812-3456-7890' },
      { name: 'OVO', number: '0812-3456-7890' },
      { name: 'GoPay', number: '0812-3456-7890' },
      { name: 'DANA', number: '0812-3456-7890' },
    ],
    qris: true,
  },
];

const tlv = (id: string, value: string) => id + String(value.length).padStart(2, '0') + value;

const crc16 = (payload: string) => {
  let crc = 0xffff;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    crc &= 0xffff;
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
};

const qrisPayload = (amount: number) => {
  const merchant =
    tlv('00', 'ID.CO.QRIS.WWW') + tlv('01', 'ID2025123456789') + tlv('02', 'KINGZ SPAREPART COMPUTER');
  const body =
    tlv('00', '01') +
    tlv('01', '12') +
    tlv('26', merchant) +
    tlv('52', '0711') +
    tlv('53', '360') +
    tlv('54', String(amount)) +
    tlv('58', 'ID') +
    tlv('59', 'Kingz Sparepart') +
    tlv('60', 'Bogor') +
    tlv('61', '16911') +
    '6304';
  return body + crc16(body);
};

async function copyText(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} disalin`);
  } catch {
    toast.error('Tidak bisa menyalin otomatis, salin manual ya');
  }
}

function PaymentDetail({ method, total }: { method: Payment; total: number }) {
  const payload = qrisPayload(total);

  return (
    <div className="border-t border-dashed">
      <p className="flex items-start gap-1.5 px-3 pt-3 text-xs leading-5 text-muted-foreground">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <span className="min-w-0">{method.hint}</span>
      </p>

      {method.accounts && (
        <ul className="mt-3 divide-y divide-dashed">
          {method.accounts.map(acc => (
            <li key={acc.name} className="flex min-w-0 items-center justify-between gap-3 px-3 py-2.5">
              <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">{acc.name}</span>
                <span className="block truncate font-mono text-sm font-medium tracking-wide">{acc.number}</span>
              </span>
              <button
                type="button"
                onClick={() => copyText(acc.number.replace(/-/g, ''), acc.name)}
                className="inline-flex shrink-0 items-center gap-1 rounded-sm border px-2 py-1 text-xs text-primary transition hover:bg-accent"
              >
                <Copy className="h-3.5 w-3.5" />
                Salin
              </button>
            </li>
          ))}
        </ul>
      )}

      {method.qris && (
        <div className="flex flex-col items-center gap-2 border-t border-dashed px-3 py-4">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Scan QRIS</span>
          <div className="rounded-md border p-2">
            <QRCodeSVG value={payload} size={168} level="M" bgColor="#FFFFFF" fgColor="#111111" />
          </div>
          <p className="max-w-xs text-center text-xs leading-5 text-muted-foreground">
            Bayar {rp(total)} pakai aplikasi apa pun yang mendukung QRIS.
          </p>
          <button
            type="button"
            onClick={() => copyText(payload, 'Nomor QRIS')}
            className="inline-flex items-center gap-1 rounded-sm border px-2 py-1 text-xs text-primary transition hover:bg-accent"
          >
            <Copy className="h-3.5 w-3.5" />
            Salin nomor QRIS
          </button>
        </div>
      )}
    </div>
  );
}

function CheckoutPage() {
  const [payment, setPayment] = useState('cod');
  const [shipping, setShipping] = useState('Reguler');
  const subtotal = PRICE;
  const shippingCost = shipping === 'Instan' ? 30000 : 15000;
  const total = subtotal + shippingCost;

  return (
    <main className="min-h-screen bg-muted/50 px-2 py-4 sm:px-4 md:py-6">
      <div className="mx-auto max-w-[1200px] space-y-3 pb-32 md:pb-0">
        <Link to="/keranjang" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
          <ChevronLeft className="h-4 w-4" />
          Kembali ke keranjang
        </Link>

        {/* Products + shipping */}
        <section className="rounded-sm bg-card shadow-sm">
          <div className="flex items-center gap-2 border-b px-3 py-4 text-primary sm:px-5">
            <Store className="h-4 w-4" />
            <span className="text-sm font-medium">Kingz Sparepart Computer</span>
          </div>

          <div className="flex flex-col gap-3 border-b px-3 py-4 sm:flex-row sm:items-center sm:gap-6 sm:px-5">
            <img
              src={photos[0]}
              alt={productTitle}
              className="h-16 w-16 shrink-0 border object-cover sm:h-20 sm:w-20"
            />
            <p className="line-clamp-2 min-w-0 flex-1 text-sm">{productTitle}</p>
            <span className="text-sm text-muted-foreground sm:w-24">1 x {rp(PRICE)}</span>
            <span className="text-sm font-medium text-primary sm:w-32 sm:text-right">{rp(PRICE)}</span>
          </div>

          {/* Shipping method */}
          <div className="flex flex-col gap-3 border-b px-3 py-4 sm:flex-row sm:px-5">
            <span className="flex shrink-0 items-start gap-1.5 text-sm font-medium text-muted-foreground sm:w-32">
              <Truck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              Pengiriman
            </span>
            <div className="min-w-0 flex-1 space-y-2">
              {['Reguler', 'Instan'].map(method => (
                <label key={method} className="flex cursor-pointer items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="shipping"
                    checked={shipping === method}
                    onChange={() => setShipping(method)}
                    className="h-4 w-4 shrink-0 accent-primary"
                  />
                  <span>{method}</span>
                  <span className="ml-auto text-primary">{method === 'Instan' ? 'Rp30.000' : 'Rp15.000'}</span>
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
              placeholder="Contoh: tolong bungkus rapi"
              className="w-full min-w-0 flex-1 border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary sm:max-w-sm"
            />
          </label>
        </section>

        {/* Payment method */}
        <section className="rounded-sm bg-card shadow-sm">
          <div className="border-b px-3 py-4 sm:px-5">
            <h2 className="text-base font-medium">Metode Pembayaran</h2>
          </div>
          <div className="flex flex-col gap-3 px-3 py-4 sm:px-5">
            {PAYMENTS.map(({ id, label, desc, icon: Icon }) => {
              const method = PAYMENTS.find(p => p.id === id)!;
              const selected = payment === id;
              return (
                <div
                  key={id}
                  className={`overflow-hidden rounded-sm border transition has-[:checked]:border-primary ${
                    selected ? 'border-primary bg-accent' : ''
                  }`}
                >
                  <label className="flex cursor-pointer items-start gap-3 p-3">
                    <input
                      type="radio"
                      name="payment"
                      checked={selected}
                      onChange={() => setPayment(id)}
                      className="mt-1 h-4 w-4 shrink-0 accent-primary"
                    />
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium">{label}</span>
                      <span className="block text-xs text-muted-foreground">{desc}</span>
                    </span>
                  </label>
                  {selected && <PaymentDetail method={method} total={total} />}
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
            <button className="shrink-0 rounded-sm bg-primary px-5 py-3 text-primary-foreground transition hover:opacity-90 sm:px-16">
              Buat Pesanan
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
