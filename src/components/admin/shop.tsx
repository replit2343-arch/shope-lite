import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ImagePlus, RotateCcw, Save, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { defaultShop, fetchShop, setShop, useShop, type Shop } from "@/lib/shop-store";

const fields: [keyof Shop, string][] = [
  ["name", "Nama toko"],
  ["badge", "Lencana (mis. Star+)"],
  ["activeText", "Status aktif"],
  ["tagline", "Deskripsi singkat"],
  ["rating", "Penilaian"],
  ["chatRate", "Persentase Chat Dibalas"],
  ["joined", "Bergabung"],
  ["products", "Produk"],
  ["chatTime", "Waktu Chat Dibalas"],
  ["followers", "Pengikut"],
];

export function AdminShop() {
  const shop = useShop();
  const [form, setForm] = useState<Shop>(shop);
  const fileInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    fetchShop();
  }, []);
  useEffect(() => setForm(shop), [shop]);

  const pickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, photo: String(reader.result) }));
    reader.readAsDataURL(file);
  };
  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Nama toko wajib diisi");
      return;
    }
    try {
      const res = await fetch("/api/shop", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Gagal menyimpan ke database");
      const updated = await res.json();
      setShop(updated);
      toast.success("Profil toko berhasil disimpan ke database PostgreSQL!");
    } catch (err: unknown) {
      setShop(form);
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan toko");
    }
  };
  const reset = async () => {
    try {
      const res = await fetch("/api/shop", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(defaultShop),
      });
      if (!res.ok) throw new Error("Gagal mereset ke database");
      const updated = await res.json();
      setShop(updated);
      toast.success("Profil toko dikembalikan ke awal di database PostgreSQL!");
    } catch {
      setShop(defaultShop);
      toast.success("Data toko dikembalikan ke awal");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Profil Toko</h2>
        <Button variant="outline" onClick={reset}>
          <RotateCcw />
          Reset
        </Button>
      </div>
      <div className="bg-card rounded-lg border p-4 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          {form.photo ? (
            <img
              src={form.photo}
              alt="Foto toko"
              className="h-20 w-20 rounded-full border object-cover bg-muted"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full border bg-muted">
              <Store className="text-muted-foreground" />
            </div>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={pickImage}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => fileInput.current?.click()}>
              <ImagePlus />
              Upload foto
            </Button>
            {form.photo && (
              <Button type="button" variant="ghost" onClick={() => setForm({ ...form, photo: "" })}>
                Hapus foto
              </Button>
            )}
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map(([key, label]) => (
            <div className="space-y-1" key={key}>
              <Label htmlFor={`shop-${key}`}>{label}</Label>
              <Input
                id={`shop-${key}`}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>
        <Button onClick={save}>
          <Save />
          Simpan
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Perubahan tersimpan langsung di database PostgreSQL dan langsung tampil di halaman beranda.
      </p>
    </div>
  );
}
