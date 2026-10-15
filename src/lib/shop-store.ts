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

function loadCache<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = sessionStorage.getItem(`vps_cache_${key}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed) return parsed;
    }
  } catch {
    // ignore
  }
  return fallback;
}

function saveCache(key: string, data: unknown) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(`vps_cache_${key}`, JSON.stringify(data));
  } catch {
    // ignore
  }
}

const cachedShop = loadCache<Shop | null>("shop", null);
const cachedProducts = loadCache<Product[] | null>("products", null);

// Live in-memory store synchronized directly with PostgreSQL backend via API endpoints
let currentShop: Shop = cachedShop || defaultShop;
let currentProducts: Product[] =
  cachedProducts && cachedProducts.length > 0 ? cachedProducts : defaultProducts;

let shopFetched = !!cachedShop;
let productsFetched = !!(cachedProducts && cachedProducts.length > 0);
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
        saveCache("shop", currentShop);
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
        saveCache("products", currentProducts);
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
        saveCache("testimonials", currentTestimonials);
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
    () => currentShop,
  );
};

export const setShop = (s: Shop) => {
  currentShop = s;
  saveCache("shop", currentShop);
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
    () => currentProducts,
  );
};

export const setProducts = (p: Product[]) => {
  currentProducts = p;
  saveCache("products", currentProducts);
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
const cachedTestimonials = loadCache<Testimonial[] | null>("testimonials", null);
let currentTestimonials: Testimonial[] =
  cachedTestimonials && cachedTestimonials.length > 0 ? cachedTestimonials : defaultTestimonials;
testimonialsFetched = !!(cachedTestimonials && cachedTestimonials.length > 0);

export const useTestimonials = () => {
  if (typeof window !== "undefined" && !testimonialsFetched) {
    testimonialsFetched = true;
    fetchTestimonials();
  }
  return useSyncExternalStore(
    subscribe,
    () => currentTestimonials,
    () => currentTestimonials,
  );
};

export const setTestimonials = (t: Testimonial[]) => {
  currentTestimonials = t;
  saveCache("testimonials", currentTestimonials);
  notify();
};

export function initStoreData(data: {
  shop?: Shop | null;
  products?: Product[] | null;
  testimonials?: Testimonial[] | null;
}) {
  let changed = false;
  if (data.shop && data.shop.name) {
    currentShop = { ...defaultShop, ...data.shop };
    shopFetched = true;
    saveCache("shop", currentShop);
    changed = true;
  }
  if (data.products && Array.isArray(data.products) && data.products.length > 0) {
    currentProducts = data.products;
    productsFetched = true;
    saveCache("products", currentProducts);
    changed = true;
  }
  if (data.testimonials && Array.isArray(data.testimonials) && data.testimonials.length > 0) {
    currentTestimonials = data.testimonials;
    testimonialsFetched = true;
    saveCache("testimonials", currentTestimonials);
    changed = true;
  }
  if (changed && typeof window !== "undefined") {
    notify();
  }
}

export function initTestimonialsData(data: Testimonial[]) {
  if (Array.isArray(data) && data.length > 0) {
    currentTestimonials = data;
    testimonialsFetched = true;
    saveCache("testimonials", currentTestimonials);
    if (typeof window !== "undefined") {
      notify();
    }
  }
}
