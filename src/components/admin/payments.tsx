import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ImagePlus,
  Pencil,
  Plus,
  Trash2,
  Wallet,
  Landmark,
  QrCode,
  Truck,
  RefreshCw,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Kind = "bank" | "ewallet" | "qris" | "cod";
type DisplayType = "account" | "qris";

export type PaymentMethod = {
  id: number;
  kind: Kind;
  name: string;
  display_type: DisplayType;
  account: string;
  holder: string;
  qris_image?: string;
  instructions?: string;
  active: boolean;
};

const empty: Omit<PaymentMethod, "id"> = {
  kind: "bank",
  name: "",
  display_type: "account",
  account: "",
  holder: "",
  qris_image: "",
  instructions: "",
  active: true,
};

const icons = { bank: Landmark, ewallet: Wallet, qris: QrCode, cod: Truck };
const labels = {
  bank: "Transfer Bank",
  ewallet: "E-Wallet (DANA/OVO/GoPay)",
  qris: "QRIS",
  cod: "Bayar di Tempat (COD)",
};

export function AdminPayments() {
  const [items, setItems] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<PaymentMethod | null>(null);
  const [form, setForm] = useState(empty);
  const [previewQris, setPreviewQris] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments");
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      console.warn("Gagal mengambil data pembayaran:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const openForm = (m?: PaymentMethod) => {
    setEditing(m ?? null);
    setForm(
      m
        ? {
            kind: m.kind,
            name: m.name,
            display_type: m.display_type || (m.kind === "qris" ? "qris" : "account"),
            account: m.account || "",
            holder: m.holder || "",
            qris_image: m.qris_image || "",
            instructions: m.instructions || "",
            active: m.active ?? true,
          }
        : empty,
    );
    setOpen(true);
  };

  const pickImage = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("File harus berupa gambar (JPG, PNG, atau WEBP)");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran gambar QRIS maksimal 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((f) => ({ ...f, qris_image: String(reader.result) }));
      toast.success("Gambar QRIS berhasil diunggah");
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Nama metode pembayaran wajib diisi");
      return;
    }

    if (
      (form.display_type === "account" || form.display_type === "both") &&
      !form.account.trim() &&
      form.kind !== "cod"
    ) {
      toast.error("Nomor rekening / nomor tujuan wajib diisi untuk mode nomor tujuan");
      return;
    }

    if (
      (form.display_type === "qris" || form.display_type === "both") &&
      !form.qris_image &&
      form.kind === "qris"
    ) {
      toast.warning("Disarankan mengunggah gambar barcode QRIS agar pembeli dapat langsung scan");
    }

    try {
      if (editing) {
        const res = await fetch(`/api/payments/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Gagal memperbarui metode");
        const updated = await res.json();
        setItems((s) => s.map((m) => (m.id === editing.id ? updated : m)));
        toast.success("Metode pembayaran berhasil diperbarui di database");
      } else {
        const res = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Gagal menambahkan metode");
        const created = await res.json();
        setItems((s) => [...s, created]);
        toast.success("Metode pembayaran baru berhasil ditambahkan");
      }
      setOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan server");
    }
  };

  const toggleActive = async (m: PaymentMethod, newActive: boolean) => {
    try {
      await fetch(`/api/payments/${m.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newActive }),
      });
      setItems((s) => s.map((x) => (x.id === m.id ? { ...x, active: newActive } : x)));
      toast.success(`Metode ${m.name} ${newActive ? "diaktifkan" : "dinonaktifkan"}`);
    } catch {
      toast.error("Gagal mengubah status aktif");
    }
  };

  const remove = async (id: number) => {
    try {
      await fetch(`/api/payments/${id}`, { method: "DELETE" });
      setItems((s) => s.filter((x) => x.id !== id));
      toast.success("Metode pembayaran dihapus dari database");
    } catch {
      toast.error("Gagal menghapus metode");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Pengaturan Metode Pembayaran</h2>
          <p className="text-xs text-muted-foreground">
            Tentukan apakah pembayaran menampilkan <b>Nomor Rekening/Tujuan</b> atau{" "}
            <b>Gambar QRIS</b> kepada pembeli.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchPayments}
            disabled={loading}
            title="Segarkan Data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => openForm()} className="gap-1.5">
            <Plus className="h-4 w-4" />
            Tambah Metode
          </Button>
        </div>
      </div>

      <div className="bg-card divide-y rounded-lg border shadow-sm">
        {items.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            {loading ? "Memuat metode pembayaran dari database..." : "Belum ada metode pembayaran."}
          </p>
        )}
        {items.map((m) => {
          const Icon = icons[m.kind] || Landmark;
          return (
            <div key={m.id} className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {m.qris_image ? (
                  <button
                    type="button"
                    onClick={() => setPreviewQris(m.qris_image || null)}
                    className="relative group h-12 w-12 shrink-0 rounded border overflow-hidden bg-muted hover:opacity-90 transition-opacity"
                    title="Klik untuk perbesar gambar QRIS"
                  >
                    <img
                      src={m.qris_image}
                      alt={`QRIS ${m.name}`}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <Eye className="h-4 w-4" />
                    </div>
                  </button>
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded border bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold">{m.name}</p>
                    <Badge variant="outline" className="text-[10px]">
                      {labels[m.kind]}
                    </Badge>
                    {m.display_type === "qris" && (
                      <Badge className="bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 text-[10px] border-purple-500/20">
                        Barcode QRIS Saja
                      </Badge>
                    )}
                    {m.display_type === "account" && (
                      <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 text-[10px] border-blue-500/20">
                        Nomor Rekening Saja
                      </Badge>
                    )}
                    {!m.active && (
                      <Badge variant="secondary" className="text-[10px]">
                        Nonaktif
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground mt-0.5">
                    {m.display_type === "qris"
                      ? m.qris_image
                        ? "✅ Gambar QRIS telah diunggah"
                        : "⚠️ Gambar QRIS belum diunggah"
                      : `${m.account || "-"} · a.n. ${m.holder || "-"}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <div className="flex items-center gap-1.5 mr-2">
                  <span className="text-xs text-muted-foreground">
                    {m.active ? "Aktif" : "Mati"}
                  </span>
                  <Switch
                    checked={m.active}
                    aria-label="Status aktif"
                    onCheckedChange={(v) => toggleActive(m, v)}
                  />
                </div>
                <Button size="icon" variant="outline" aria-label="Ubah" onClick={() => openForm(m)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Hapus"
                  onClick={() => remove(m.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Dialog Form Tambah / Ubah */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Ubah Metode Pembayaran" : "Tambah Metode Pembayaran Baru"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Kategori Pembayaran</Label>
              <Select
                value={form.kind}
                onValueChange={(v) => {
                  const k = v as Kind;
                  setForm({
                    ...form,
                    kind: k,
                    display_type: k === "qris" ? "qris" : form.display_type,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(labels) as Kind[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      {labels[k]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pn">
                Nama Tampilan (contoh: Bank BCA, DANA, QRIS All Payment, COD)
              </Label>
              <Input
                id="pn"
                placeholder="Contoh: BCA Transfer / QRIS Kingz"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            {/* Opsi Penentuan: Nomor Rekening Saja ATAU Barcode QRIS Saja (Tidak Bisa Bersamaan) */}
            {form.kind !== "cod" && (
              <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
                <Label className="text-xs font-semibold text-primary">
                  Pengaturan Tampilan Rekening / Barcode:
                </Label>
                <RadioGroup
                  value={form.display_type}
                  onValueChange={(v) => setForm({ ...form, display_type: v as DisplayType })}
                  className="space-y-2 pt-1"
                >
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                    <RadioGroupItem value="account" id="dt-account" className="mt-0.5" />
                    <div>
                      <span className="font-medium text-foreground">
                        Hanya Menampilkan Nomor Rekening Saja
                      </span>
                      <p className="text-muted-foreground text-[11px]">
                        Pembeli hanya melihat nomor rekening / nomor tujuan untuk disalin. Barcode
                        tidak ditampilkan.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-xs">
                    <RadioGroupItem value="qris" id="dt-qris" className="mt-0.5" />
                    <div>
                      <span className="font-medium text-foreground">
                        Hanya Menampilkan Barcode / Gambar QRIS Saja
                      </span>
                      <p className="text-muted-foreground text-[11px]">
                        Pembeli hanya melihat barcode QRIS yang diupload untuk di-scan. Nomor
                        rekening tidak ditampilkan.
                      </p>
                    </div>
                  </label>
                </RadioGroup>
              </div>
            )}

            {/* Input Nomor Tujuan (jika dipilih account) */}
            {(form.display_type === "account" || form.kind === "cod") && (
              <div className="space-y-3 rounded-lg border p-3">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  Informasi Nomor Rekening / Akun Tujuan
                </p>
                <div className="space-y-1">
                  <Label htmlFor="pa">No. Rekening / No. Handphone</Label>
                  <Input
                    id="pa"
                    placeholder="Contoh: 1234567890 atau 081234567890"
                    value={form.account}
                    onChange={(e) => setForm({ ...form, account: e.target.value })}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ph">Atas Nama (Pemilik Rekening / Akun)</Label>
                  <Input
                    id="ph"
                    placeholder="Contoh: Kingz Sparepart Computer"
                    value={form.holder}
                    onChange={(e) => setForm({ ...form, holder: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Upload Gambar QRIS (jika dipilih qris) */}
            {form.display_type === "qris" && (
              <div className="space-y-3 rounded-lg border p-3 bg-card">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <QrCode className="h-3.5 w-3.5 text-primary" />
                  Upload Gambar Barcode QRIS
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {form.qris_image ? (
                    <div className="relative group">
                      <img
                        src={form.qris_image}
                        alt="QRIS Preview"
                        className="h-28 w-28 rounded-md border object-contain bg-muted p-1"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute -right-2 -top-2 h-6 w-6 p-0 rounded-full text-xs"
                        aria-label="Hapus gambar"
                        onClick={() => setForm({ ...form, qris_image: "" })}
                      >
                        ×
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="flex h-28 w-28 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-primary/40 bg-muted/30 text-center hover:bg-muted/60 transition-colors"
                    >
                      <ImagePlus className="h-6 w-6 text-primary mb-1" />
                      <span className="text-[11px] font-medium text-primary">Upload QRIS</span>
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs text-muted-foreground flex-1">
                    <p className="font-medium text-foreground">Upload Barcode QRIS Toko Anda</p>
                    <p>Format yang didukung: JPG, PNG, atau WEBP (Maksimal 2 MB).</p>
                    <Button
                      variant="outline"
                      size="sm"
                      type="button"
                      className="text-xs gap-1.5 mt-1"
                      onClick={() => fileRef.current?.click()}
                    >
                      <ImagePlus className="h-3.5 w-3.5" />
                      {form.qris_image ? "Ganti Gambar QRIS" : "Pilih File Gambar QRIS"}
                    </Button>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        pickImage(e.target.files?.[0]);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="pi">Petunjuk / Catatan Pembayaran (Opsional)</Label>
              <Input
                id="pi"
                placeholder="Contoh: Cantumkan ID pesanan pada berita transfer"
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={save}>Simpan ke Database</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Preview Gambar QRIS Besar */}
      <Dialog open={!!previewQris} onOpenChange={() => setPreviewQris(null)}>
        <DialogContent className="max-w-xs text-center">
          <DialogHeader>
            <DialogTitle>Preview Barcode QRIS</DialogTitle>
          </DialogHeader>
          {previewQris && (
            <div className="p-2 flex flex-col items-center">
              <img
                src={previewQris}
                alt="QRIS Besar"
                className="max-h-72 w-auto object-contain rounded border"
              />
              <p className="text-xs text-muted-foreground mt-2">
                Gambar barcode QRIS yang akan ditampilkan kepada pembeli.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
