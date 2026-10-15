import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthCard({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const fillAdmin = () => {
    setEmail("admin@kingz.id");
    setPassword("admin123456");
    toast.info("Kredensial admin diisi otomatis dari .env");
  };

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Kata sandi minimal 6 karakter");
      return;
    }
    if (!isLogin && password !== confirm) {
      toast.error("Kata sandi tidak sama");
      return;
    }

    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin ? { email, password } : { name, email, phone, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal memproses autentikasi");
      }

      localStorage.setItem("kingz_auth", JSON.stringify({ token: data.token, user: data.user }));
      toast.success(isLogin ? `Berhasil masuk sebagai ${data.user.name}` : "Akun berhasil dibuat!");

      if (data.user?.role === "admin") {
        navigate({ to: "/admin" });
      } else {
        navigate({ to: "/" });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan koneksi server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10 pb-28">
      <div className="w-full max-w-sm bg-card rounded-lg border p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-primary font-bold text-sm">Kingz Sparepart Computer</p>
          <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-mono">
            Express & PostgreSQL
          </span>
        </div>
        <h1 className="text-2xl font-bold mt-1">{isLogin ? "Masuk" : "Daftar Akun"}</h1>
        <p className="text-muted-foreground mt-1 mb-4 text-xs">
          {isLogin
            ? "Masuk untuk belanja, chat penjual, atau akses admin."
            : "Buat akun baru untuk mulai berbelanja sparepart original."}
        </p>

        {isLogin && (
          <div className="mb-4 rounded-md border border-primary/20 bg-primary/5 p-3 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-primary mb-1">
              <Shield className="h-3.5 w-3.5" />
              <span>Akun Admin (dari .env):</span>
            </div>
            <p className="text-muted-foreground font-mono">admin@kingz.id / admin123456</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2 w-full h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
              onClick={fillAdmin}
            >
              <Sparkles className="h-3 w-3" />
              Gunakan Akun Admin
            </Button>
          </div>
        )}

        <form onSubmit={submit} className="space-y-3.5">
          {!isLogin && (
            <>
              <div className="space-y-1">
                <Label htmlFor="name">Nama Lengkap</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Nama Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">No. HP (WhatsApp)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="08xxxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password">Kata Sandi</Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {!isLogin && (
            <div className="space-y-1">
              <Label htmlFor="confirm">Ulangi Kata Sandi</Label>
              <Input
                id="confirm"
                type="password"
                placeholder="Ketik ulang kata sandi"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
          )}

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Menghubungkan Server..." : isLogin ? "Masuk" : "Daftar Sekarang"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-5">
          {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
          <Link to={isLogin ? "/register" : "/login"} className="text-primary font-bold">
            {isLogin ? "Daftar" : "Masuk"}
          </Link>
        </p>
      </div>
    </div>
  );
}
