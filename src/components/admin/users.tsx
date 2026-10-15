import { useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type Role = 'admin' | 'pembeli';
type User = { id: number; name: string; email: string; phone: string; role: Role; active: boolean };
const empty: Omit<User, 'id'> = { name: '', email: '', phone: '', role: 'pembeli', active: true };

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([
    { id: 1, name: 'Admin Kingz', email: 'admin@kingz.id', phone: '081200000001', role: 'admin', active: true },
    { id: 2, name: 'Budi Santoso', email: 'budi@mail.com', phone: '081234567890', role: 'pembeli', active: true },
    { id: 3, name: 'Siti Aminah', email: 'siti@mail.com', phone: '085711112222', role: 'pembeli', active: false },
  ]);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(empty);

  const openForm = (u?: User) => {
    setEditing(u ?? null);
    setForm(u ? { name: u.name, email: u.email, phone: u.phone, role: u.role, active: u.active } : empty);
    setOpen(true);
  };
  const save = () => {
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) { toast.error('Nama dan email valid wajib diisi'); return; }
    if (editing) setUsers((s) => s.map((u) => (u.id === editing.id ? { ...u, ...form } : u)));
    else setUsers((s) => [...s, { id: Date.now(), ...form }]);
    toast.success(editing ? 'User diperbarui' : 'User ditambahkan');
    setOpen(false);
  };
  const shown = users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Manajemen User</h2>
        <Button onClick={() => openForm()}><Plus />Tambah</Button>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Cari nama atau email" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="bg-card divide-y rounded-lg border shadow-sm">
        {shown.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">Tidak ada user.</p>}
        {shown.map((u) => (
          <div key={u.id} className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">{u.name[0]}</div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{u.name}</p>
                <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>{u.role}</Badge>
                {!u.active && <Badge variant="outline">nonaktif</Badge>}
              </div>
              <p className="truncate text-xs text-muted-foreground">{u.email} · {u.phone}</p>
            </div>
            <Switch checked={u.active} aria-label="Aktif" onCheckedChange={(v) => setUsers((s) => s.map((x) => (x.id === u.id ? { ...x, active: v } : x)))} />
            <Button size="icon" variant="outline" aria-label="Ubah" onClick={() => openForm(u)}><Pencil /></Button>
            <Button size="icon" variant="outline" aria-label="Hapus" onClick={() => { setUsers((s) => s.filter((x) => x.id !== u.id)); toast.success('User dihapus'); }}><Trash2 /></Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Ubah User' : 'Tambah User'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1"><Label htmlFor="un">Nama</Label><Input id="un" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-1"><Label htmlFor="ue">Email</Label><Input id="ue" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-1"><Label htmlFor="up">No. HP</Label><Input id="up" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-1"><Label>Peran</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="pembeli">Pembeli</SelectItem><SelectItem value="admin">Admin</SelectItem></SelectContent>
              </Select>
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
