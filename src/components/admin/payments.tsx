import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { ImagePlus, Pencil, Plus, Trash2, Wallet, Landmark, QrCode, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Kind = 'bank' | 'ewallet' | 'qris' | 'cod';
type Method = { id: number; kind: Kind; name: string; account: string; holder: string; active: boolean; image?: string };
const empty: Omit<Method, 'id'> = { kind: 'bank', name: '', account: '', holder: '', active: true, image: '' };
const icons = { bank: Landmark, ewallet: Wallet, qris: QrCode, cod: Truck };
const labels = { bank: 'Transfer Bank', ewallet: 'E-Wallet', qris: 'QRIS', cod: 'Bayar di Tempat' };

export function AdminPayments() {
  const [items, setItems] = useState<Method[]>([
    { id: 1, kind: 'bank', name: 'BCA', account: '1234567890', holder: 'Kingz Sparepart', active: true },
    { id: 2, kind: 'ewallet', name: 'DANA', account: '081200000001', holder: 'Kingz Sparepart', active: true },
    { id: 3, kind: 'qris', name: 'QRIS', account: '-', holder: 'Kingz Sparepart', active: true },
    { id: 4, kind: 'cod', name: 'COD', account: '-', holder: '-', active: false },
  ]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Method | null>(null);
  const [form, setForm] = useState(empty);
  const fileRef = useRef<HTMLInputElement>(null);

  const openForm = (m?: Method) => {
    setEditing(m ?? null);
    setForm(m ? { kind: m.kind, name: m.name, account: m.account, holder: m.holder, active: m.active, image: m.image ?? '' } : empty);
    setOpen(true);
  };
  const pickImage = (file?: File | null) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error('File harus berupa gambar'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('Ukuran gambar maksimal 2 MB'); return; }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: String(reader.result) }));
    reader.readAsDataURL(file);
  };
  const save = () => {
    if (!form.name.trim()) { toast.error('Nama metode wajib diisi'); return; }
    if (editing) setItems((s) => s.map((m) => (m.id === editing.id ? { ...m, ...form } : m)));
    else setItems((s) => [...s, { id: Date.now(), ...form }]);
    toast.success(editing ? 'Metode diperbarui' : 'Metode ditambahkan');
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Metode Pembayaran</h2>
        <Button onClick={() => openForm()}><Plus />Tambah</Button>
      </div>
      <div className="bg-card divide-y rounded-lg border shadow-sm">
        {items.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Belum ada metode.</p>}
        {items.map((m) => {
          const Icon = icons[m.kind];
          return (
            <div key={m.id} className="flex items-center gap-3 p-4">
              {m.image ? (
                <img src={m.image} alt={m.name} className="h-10 w-10 shrink-0 rounded bg-muted object-cover" />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded bg-muted"><Icon className="h-5 w-5 text-primary" /></div>
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{m.name} <span className="text-xs font-normal text-muted-foreground">· {labels[m.kind]}</span></p>
                <p className="truncate text-xs text-muted-foreground">{m.account} · a.n. {m.holder}</p>
              </div>
              <Switch checked={m.active} aria-label="Aktif" onCheckedChange={(v) => setItems((s) => s.map((x) => (x.id === m.id ? { ...x, active: v } : x)))} />
              <Button size="icon" variant="outline" aria-label="Ubah" onClick={() => openForm(m)}><Pencil /></Button>
              <Button size="icon" variant="outline" aria-label="Hapus" onClick={() => { setItems((s) => s.filter((x) => x.id !== m.id)); toast.success('Metode dihapus'); }}><Trash2 /></Button>
            </div>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Ubah Metode' : 'Tambah Metode'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label>Jenis</Label>
              <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v as Kind })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(Object.keys(labels) as Kind[]).map((k) => <SelectItem key={k} value={k}>{labels[k]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label htmlFor="pn">Nama (mis. BCA, OVO)</Label><Input id="pn" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1"><Label htmlFor="pa">No. rekening / akun</Label><Input id="pa" value={form.account} onChange={(e) => setForm({ ...form, account: e.target.value })} /></div>
            <div className="space-y-1"><Label htmlFor="ph">Atas nama</Label><Input id="ph" value={form.holder} onChange={(e) => setForm({ ...form, holder: e.target.value })} /></div>
            <div className="space-y-1">
              <Label>Gambar (logo / QR, opsional)</Label>
              <div className="flex items-center gap-3">
                {form.image ? (
                  <div className="relative">
                    <img src={form.image} alt="Gambar metode" className="h-16 w-16 rounded border object-cover" />
                    <Button size="icon" variant="destructive" className="absolute -right-2 -top-2 h-5 w-5 rounded-full" aria-label="Hapus gambar" onClick={() => setForm({ ...form, image: '' })}>×</Button>
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded border border-dashed text-muted-foreground"><ImagePlus className="h-5 w-5" /></div>
                )}
                <Button variant="outline" type="button" onClick={() => fileRef.current?.click()}><ImagePlus />Pilih Gambar</Button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { pickImage(e.target.files?.[0]); e.target.value = ''; }} />
              </div>
              <p className="text-xs text-muted-foreground">Format JPG/PNG, maksimal 2 MB.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
            <Button onClick={save}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
