import { useSyncExternalStore } from "react";
import { photos, productTitle, storePhoto } from "@/components/product/product-data";

export type Shop = {
  name: string;
  badge: string;
  activeText: string;
  photo: string;
  tagline: string;
  rating: string;
  chatRate: string;
  joined: string;
  products: string;
  chatTime: string;
  followers: string;
};
export type Specs = {
  category: string;
  brand: string;
  warrantyPeriod: string;
  warrantyType: string;
  custom: string;
  certificate: string;
  origin: string;
  shipFrom: string;
  shippingGuarantee: string;
  lateVoucher: string;
  returnProtection: string;
  description: string;
};
export type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  images: string[];
  specs: Specs;
};

export const defaultShop: Shop = {
  name: "Kingz Sparepart Computer",
  badge: "Star+",
  activeText: "Aktif 2 Jam Lalu",
  photo: storePhoto,
  tagline: "Sparepart komputer & adaptor laptop",
  rating: "466",
  chatRate: "96%",
  joined: "6 tahun lalu",
  products: "180",
  chatTime: "hitungan jam",
  followers: "120",
};
export const emptySpecs: Specs = {
  category: "",
  brand: "",
  warrantyPeriod: "",
  warrantyType: "",
  custom: "Tidak",
  certificate: "-",
  origin: "-",
  shipFrom: "",
  shippingGuarantee: "Garansi tiba Hari Ini, jika pesan sebelum 10:00",
  lateVoucher: "Dapatkan Voucher s/d RM 5.00 jika pesanan terlambat.",
  returnProtection: "Bebas Pengembalian • Proteksi Elektronik",
  description: "",
};
const defaultProducts: Product[] = [
  {
    id: 1,
    name: productTitle,
    price: 59,
    stock: 25,
    images: [...photos],
    specs: {
      category:
        "Shopee > Komputer & Aksesoris > Aksesoris Desktop & Laptop > Charger & Adaptor Laptop",
      brand: "Asus",
      warrantyPeriod: "6 Bulan",
      warrantyType: "Garansi Supplier",
      custom: "Tidak",
      certificate: "-",
      origin: "-",
      shipFrom: "KOTA JAKARTA PUSAT",
      shippingGuarantee: "Garansi tiba Hari Ini, jika pesan sebelum 10:00",
      lateVoucher: "Dapatkan Voucher s/d RM 5.00 jika pesanan terlambat.",
      returnProtection: "Bebas Pengembalian • Proteksi Elektronik",
      description: `NOTE : BARANG YANG DIKIRIM SESUAI GAMBAR

${productTitle}

Model : A19-090P2A
INPUT : AC 100-240 50-60HZ 1.5A
Output Voltage : 19V 4.74A 90W
Konektor : 4.5*3.0mm

Kondisi : Baru/New
Kualitas : Original
Garansi : 3 Bulan

Compatible untuk all type Laptop Asus dengan spek adaptor yang sama.`,
    },
  },
];

const listeners = new Set<() => void>();
const cache: Record<string, unknown> = {};
function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  if (!(key in cache)) {
    try {
      const raw = localStorage.getItem(key);
      cache[key] = raw ? JSON.parse(raw) : fallback;
      if (key === "kingz-products")
        cache[key] = (cache[key] as (Product & { image?: string })[]).map((p) => ({
          ...p,
          price: p.price >= 1000 ? 59 : p.price,
          images: p.images ?? (p.image ? [p.image] : []),
        }));
    } catch {
      cache[key] = fallback;
    }
  }
  return cache[key] as T;
}
function write<T>(key: string, value: T) {
  cache[key] = value;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage penuh */
  }
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useShop = () =>
  useSyncExternalStore(
    subscribe,
    () => read("kingz-shop", defaultShop),
    () => defaultShop,
  );
export const setShop = (s: Shop) => write("kingz-shop", s);
export const useProducts = () =>
  useSyncExternalStore(
    subscribe,
    () => read("kingz-products", defaultProducts),
    () => defaultProducts,
  );
export const setProducts = (p: Product[]) => write("kingz-products", p);

export type Testimonial = {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
  media: string;
};
import { reviews as seedReviews } from "@/components/product/product-data";
const defaultTestimonials: Testimonial[] = seedReviews.map((r) => ({ ...r, rating: 5 }));
export const useTestimonials = () =>
  useSyncExternalStore(
    subscribe,
    () => read("kingz-testimonials", defaultTestimonials),
    () => defaultTestimonials,
  );
export const setTestimonials = (t: Testimonial[]) => write("kingz-testimonials", t);
