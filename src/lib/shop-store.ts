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

// Live in-memory store synchronized directly with PostgreSQL backend via API endpoints
let currentShop: Shop = defaultShop;
let currentProducts: Product[] = defaultProducts;

let shopFetched = false;
let productsFetched = false;
let testimonialsFetched = false;

const listeners = new Set<() => void>();
function notify() {
  listeners.forEach((l) => l());
}

export function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export async function fetchShop() {
  try {
    const res = await fetch("/api/shop");
    if (res.ok) {
      const data = await res.json();
      if (data && data.name) {
        currentShop = { ...defaultShop, ...data };
        shopFetched = true;
        notify();
      }
    }
  } catch (err) {
    console.warn("Gagal mengambil data toko:", err);
  }
}

export async function fetchProducts() {
  try {
    const res = await fetch("/api/products");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        currentProducts = data;
        productsFetched = true;
        notify();
      }
    }
  } catch (err) {
    console.warn("Gagal mengambil data produk:", err);
  }
}

export async function fetchTestimonials() {
  try {
    const res = await fetch("/api/testimonials");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        currentTestimonials = data;
        testimonialsFetched = true;
        notify();
      }
    }
  } catch (err) {
    console.warn("Gagal mengambil data testimoni:", err);
  }
}

export const useShop = () => {
  if (typeof window !== "undefined" && !shopFetched) {
    shopFetched = true;
    fetchShop();
  }
  return useSyncExternalStore(
    subscribe,
    () => currentShop,
    () => defaultShop,
  );
};

export const setShop = (s: Shop) => {
  currentShop = s;
  notify();
};

export const useProducts = () => {
  if (typeof window !== "undefined" && !productsFetched) {
    productsFetched = true;
    fetchProducts();
  }
  return useSyncExternalStore(
    subscribe,
    () => currentProducts,
    () => defaultProducts,
  );
};

export const setProducts = (p: Product[]) => {
  currentProducts = p;
  notify();
};

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
let currentTestimonials: Testimonial[] = defaultTestimonials;

export const useTestimonials = () => {
  if (typeof window !== "undefined" && !testimonialsFetched) {
    testimonialsFetched = true;
    fetchTestimonials();
  }
  return useSyncExternalStore(
    subscribe,
    () => currentTestimonials,
    () => defaultTestimonials,
  );
};

export const setTestimonials = (t: Testimonial[]) => {
  currentTestimonials = t;
  notify();
};
