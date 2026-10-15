import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Search, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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

type Role = "admin" | "pembeli";
type User = { id: number; name: string; email: string; phone: string; role: Role; active: boolean };
const empty: Omit<User, "id"> = { name: "", email: "", phone: "", role: "pembeli", active: true };

export function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(empty);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.warn("Gagal fetch users:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openForm = (u?: User) => {
    setEditing(u ?? null);
    setForm(
      u ? { name: u.name, email: u.email, phone: u.phone, role: u.role, active: u.active } : empty,
    );
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error("Nama dan email valid wajib diisi");
      return;
    }

    try {
      if (editing) {
        const res = await fetch(`/api/users/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Gagal update user");
        const updated = await res.json();
        setUsers((s) => s.map((u) => (u.id === editing.id ? updated : u)));
        toast.success("User berhasil diperbarui di database");
      } else {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Gagal tambah user");
        const created = await res.json();
        setUsers((s) => [...s, created]);
        toast.success("User berhasil ditambahkan ke database");
      }
      setOpen(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan user");
    }
  };

  const toggleActive = async (u: User, newActive: boolean) => {
    try {
      await fetch(`/api/users/${u.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: newActive }),
      });
      setUsers((s) => s.map((x) => (x.id === u.id ? { ...x, active: newActive } : x)));
      toast.success(`Status user diubah`);
    } catch {
      toast.error("Gagal mengubah status");
    }
  };

  const removeUser = async (id: number) => {
    try {
      await fetch(`/api/users/${id}`, { method: "DELETE" });
      setUsers((s) => s.filter((x) => x.id !== id));
      toast.success("User berhasil dihapus dari database");
    } catch {
      toast.error("Gagal menghapus user");
    }
  };

  const shown = users.filter((u) => `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Manajemen User (Database PostgreSQL / Express)</h2>
          <p className="text-xs text-muted-foreground">
            Kelola akun admin dan pembeli yang tersimpan di database.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchUsers}
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={() => openForm()}>
            <Plus className="mr-1 h-4 w-4" />
            Tambah User
          </Button>
        </div>
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Cari nama atau email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>
      <div className="bg-card divide-y rounded-lg border shadow-sm">
        {shown.length === 0 && (
          <p className="p-6 text-center text-sm text-muted-foreground">
            {loading ? "Memuat data dari database..." : "Tidak ada user."}
          </p>
        )}
        {shown.map((u) => (
          <div key={u.id} className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
              {u.name ? u.name[0] : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium">{u.name}</p>
                <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                {!u.active && <Badge variant="outline">nonaktif</Badge>}
              </div>
              <p className="truncate text-xs text-muted-foreground">
                {u.email} · {u.phone || "Tanpa No. HP"}
              </p>
            </div>
            <Switch
              checked={u.active}
              aria-label="Aktif"
              onCheckedChange={(v) => toggleActive(u, v)}
            />
            <Button size="icon" variant="outline" aria-label="Ubah" onClick={() => openForm(u)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              aria-label="Hapus"
              onClick={() => removeUser(u.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Ubah User" : "Tambah User Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="un">Nama</Label>
              <Input
                id="un"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ue">Email</Label>
              <Input
                id="ue"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="up">No. HP</Label>
              <Input
                id="up"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Peran</Label>
              <Select
                value={form.role}
                onValueChange={(v) => setForm({ ...form, role: v as Role })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pembeli">Pembeli</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
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
    </div>
  );
}
