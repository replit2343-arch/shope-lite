import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { X, ImagePlus, Pencil, Plus, Trash2, Package, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { emptySpecs, fetchProducts, useProducts, type Product, type Specs } from "@/lib/shop-store";
import { formatRM } from "@/lib/currency";

const empty: Omit<Product, "id"> = { name: "", price: 0, stock: 0, images: [], specs: emptySpecs };
const specFields: [keyof Specs, string][] = [
  ["category", "Kategori (pisahkan dengan >)"],
  ["brand", "Merek"],
  ["warrantyPeriod", "Masa Garansi"],
  ["warrantyType", "Jenis Garansi"],
  ["custom", "Produk Custom"],
  ["certificate", "No.Sertifikat (SNI,K3L,UTTP)"],
  ["origin", "Asal Produk"],
  ["shipFrom", "Dikirim Dari"],
  ["shippingGuarantee", "Garansi Pengiriman (cth: Garansi tiba Hari Ini...)"],
  ["lateVoucher", "Voucher Keterlambatan (cth: Dapatkan Voucher s/d RM 5.00...)"],
  ["returnProtection", "Jaminan Pengembalian & Proteksi (cth: Bebas Pengembalian...)"],
];
const rp = (n: number) => formatRM(n);

export function AdminProducts() {
  const items = useProducts();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    await fetchProducts();
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} bukan gambar`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () =>
        setForm((f) => ({ ...f, images: [...f.images, String(reader.result)] }));
      reader.readAsDataURL(file);
    });
  };

  const openForm = (p?: Product) => {
    setEditing(p ?? null);
    setForm(
      p
        ? {
            name: p.name,
            price: p.price,
            stock: p.stock,
            images: [...p.images],
            specs: { ...emptySpecs, ...p.specs },
          }
        : empty,
    );
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || form.price <= 0) {
      toast.error("Nama dan harga wajib diisi");
      return;
    }
    try {
      if (editing) {
        const res = await fetch(`/api/products/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Gagal memperbarui produk di database");
        await fetchProducts();
        toast.success("Produk berhasil diperbarui di database PostgreSQL");
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Gagal menambahkan produk ke database");
        await fetchProducts();
        toast.success("Produk berhasil ditambahkan ke database PostgreSQL");
      }
      setOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan produk");
    }
  };

  const remove = async (id: number) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal menghapus produk");
      await fetchProducts();
      toast.success("Produk berhasil dihapus dari database PostgreSQL");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus produk");
    }
  };

  const totalStock = items.reduce((a, p) => a + p.stock, 0);

  return (
    <div>
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Manajemen Produk</h2>
            <p className="text-xs text-muted-foreground">
              Tersimpan di database PostgreSQL &amp; dapat diakses oleh semua pembeli.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={loadData}
              disabled={loading}
              title="Refresh Produk"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button onClick={() => openForm()} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Tambah Produk
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-lg border p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Jumlah produk</p>
            <p className="text-2xl font-bold">{items.length}</p>
          </div>
          <div className="bg-card rounded-lg border p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">Total stok</p>
            <p className="text-2xl font-bold">{totalStock}</p>
          </div>
        </div>

        <div className="bg-card rounded-lg border shadow-sm divide-y">
          {items.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">Belum ada produk.</p>
          )}
          {items.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-4">
              {p.images[0] ? (
                <img
                  src={p.images[0]}
                  alt={p.name}
                  className="h-14 w-14 shrink-0 rounded object-contain bg-muted"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-muted">
                  <Package className="text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium">{p.name}</p>
                <p className="text-sm font-bold text-primary">{rp(p.price)}</p>
                <p className="text-xs text-muted-foreground">Stok: {p.stock}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button size="icon" variant="outline" aria-label="Ubah" onClick={() => openForm(p)}>
                  <Pencil />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Hapus"
                  onClick={() => remove(p.id)}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          Semua produk tersimpan di database PostgreSQL dan langsung tampil di halaman toko.
        </p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Ubah Produk" : "Tambah Produk"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="n">Nama produk</Label>
              <Input
                id="n"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="p">Harga (RM)</Label>
                <Input
                  id="p"
                  type="number"
                  min={0}
                  value={form.price || ""}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="s">Stok</Label>
                <Input
                  id="s"
                  type="number"
                  min={0}
                  value={form.stock || ""}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Gambar produk</Label>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={pickImage}
              />
              <div className="flex flex-wrap gap-2">
                {form.images.map((img, i) => (
                  <div key={i} className="relative">
                    <img
                      src={img}
                      alt={`Gambar produk ${i + 1}`}
                      className="h-16 w-16 rounded border object-contain bg-muted"
                    />
                    {i === 0 && (
                      <span className="absolute bottom-0 left-0 rounded-tr bg-primary px-1 text-[10px] text-primary-foreground">
                        Utama
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label={`Hapus gambar ${i + 1}`}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground"
                      onClick={() =>
                        setForm((f) => ({ ...f, images: f.images.filter((_, j) => j !== i) }))
                      }
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="flex h-16 w-16 flex-col items-center justify-center rounded border border-dashed text-xs text-muted-foreground"
                >
                  <ImagePlus className="h-5 w-5" />
                  Tambah
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Bisa pilih beberapa gambar sekaligus. Gambar pertama jadi gambar utama.
              </p>
            </div>
            <h3 className="pt-2 text-sm font-semibold">Spesifikasi Produk</h3>
            {specFields.map(([key, label]) => (
              <div className="space-y-1" key={key}>
                <Label htmlFor={`spec-${key}`}>{label}</Label>
                <Input
                  id={`spec-${key}`}
                  value={form.specs[key]}
                  onChange={(e) =>
                    setForm({ ...form, specs: { ...form.specs, [key]: e.target.value } })
                  }
                />
              </div>
            ))}
            <div className="space-y-1">
              <Label htmlFor="spec-desc">Deskripsi Produk</Label>
              <Textarea
                id="spec-desc"
                rows={8}
                value={form.specs.description}
                onChange={(e) =>
                  setForm({ ...form, specs: { ...form.specs, description: e.target.value } })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={save}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
