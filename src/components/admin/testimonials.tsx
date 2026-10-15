import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Star, Trash2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { setTestimonials, useTestimonials, type Testimonial } from "@/lib/shop-store";

const pad = (n: number) => String(n).padStart(2, "0");
const fmt = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
const empty = { name: "", rating: 5, comment: "", date: "", avatar: "", media: "" };

function readImage(file: File, cb: (url: string) => void) {
  const img = new Image();
  const reader = new FileReader();
  reader.onload = () => {
    img.onload = () => {
      const max = 800;
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = img.width * s;
      c.height = img.height * s;
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      cb(c.toDataURL("image/jpeg", 0.8));
    };
    img.src = reader.result as string;
  };
  reader.readAsDataURL(file);
}

export function AdminTestimonials() {
  const list = useTestimonials();
  const [form, setForm] = useState<Omit<Testimonial, "id">>(empty);
  const [editId, setEditId] = useState<number | null>(null);
  const [live, setLive] = useState(true);
  const [now, setNow] = useState("");

  useEffect(() => {
    if (!live) return undefined;
    const tick = () => setNow(fmt(new Date()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [live]);

  const reset = () => {
    setForm(empty);
    setEditId(null);
    setLive(true);
  };

  const save = () => {
    if (!form.name.trim()) {
      toast.error("Nama wajib diisi");
      return;
    }
    const data = { ...form, date: live ? fmt(new Date()) : form.date };
    if (editId) setTestimonials(list.map((t) => (t.id === editId ? { ...data, id: editId } : t)));
    else setTestimonials([{ ...data, id: Date.now() }, ...list]);
    toast.success(editId ? "Testimoni diperbarui" : "Testimoni ditambahkan");
    reset();
  };

  const edit = (t: Testimonial) => {
    const { id, ...rest } = t;
    setForm(rest);
    setEditId(id);
    setLive(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const remove = (id: number) => {
    if (confirm("Hapus testimoni ini?")) {
      setTestimonials(list.filter((t) => t.id !== id));
      toast.success("Testimoni dihapus");
      if (editId === id) reset();
    }
  };

  const toLocalInput = (s: string) => (s ? s.replace(" ", "T").slice(0, 16) : "");

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{editId ? "Edit Testimoni" : "Tambah Testimoni"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="t-name">Nama pembeli</Label>
            <Input
              id="t-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="contoh: arsaid"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Bintang</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`${n} bintang`}
                  onClick={() => setForm({ ...form, rating: n })}
                >
                  <Star
                    className={
                      n <= form.rating
                        ? "h-7 w-7 fill-primary text-primary"
                        : "h-7 w-7 text-muted-foreground"
                    }
                  />
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="t-comment">Keterangan</Label>
            <Textarea
              id="t-comment"
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder="Barang sesuai, pengiriman cepat..."
            />
          </div>
          <div className="space-y-2">
            <Label>Waktu</Label>
            <div className="flex items-center gap-2">
              <Switch checked={live} onCheckedChange={setLive} id="t-live" />
              <Label htmlFor="t-live" className="font-normal">
                Waktu realtime (sekarang)
              </Label>
            </div>
            {live ? (
              <p className="rounded-md border bg-muted px-3 py-2 font-mono text-sm">{now}</p>
            ) : (
              <Input
                type="datetime-local"
                value={toLocalInput(form.date)}
                onChange={(e) => setForm({ ...form, date: e.target.value.replace("T", " ") })}
              />
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["avatar", "media"] as const).map((k) => (
              <div key={k} className="space-y-1.5">
                <Label>{k === "avatar" ? "Foto profil pembeli" : "Foto produk / ulasan"}</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) readImage(f, (url) => setForm((p) => ({ ...p, [k]: url })));
                    e.target.value = "";
                  }}
                />
                {form[k] && (
                  <div className="flex items-end gap-2">
                    <img
                      src={form[k]}
                      alt=""
                      className="h-20 w-20 rounded-md border object-cover"
                    />
                    <Button size="sm" variant="ghost" onClick={() => setForm({ ...form, [k]: "" })}>
                      Hapus
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button onClick={save}>
              {editId ? (
                <>
                  <Pencil /> Simpan
                </>
              ) : (
                <>
                  <Plus /> Tambah
                </>
              )}
            </Button>
            {editId && (
              <Button variant="outline" onClick={reset}>
                Batal
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Testimoni ({list.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {list.length === 0 && (
            <p className="text-sm text-muted-foreground">Belum ada testimoni.</p>
          )}
          {list.map((t) => (
            <div key={t.id} className="flex gap-3 rounded-lg border p-3">
              {t.avatar ? (
                <img
                  src={t.avatar}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <UserRound size={20} />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{t.name}</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={
                        n <= t.rating
                          ? "h-3.5 w-3.5 fill-primary text-primary"
                          : "h-3.5 w-3.5 text-muted-foreground"
                      }
                    />
                  ))}
                </div>
                {t.date && <p className="text-xs text-muted-foreground">{t.date}</p>}
                {t.comment && <p className="mt-1 text-sm">{t.comment}</p>}
                {t.media && (
                  <img src={t.media} alt="" className="mt-2 h-20 w-20 rounded-md object-cover" />
                )}
              </div>
              <div className="flex shrink-0 flex-col gap-1">
                <Button size="icon" variant="outline" aria-label="Edit" onClick={() => edit(t)}>
                  <Pencil />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label="Hapus"
                  onClick={() => remove(t.id)}
                >
                  <Trash2 />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
