import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Package,
  Settings,
  LogOut,
  ChevronRight,
  MessageCircle,
  Shield,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profil | Kingz Sparepart Computer" },
      {
        name: "description",
        content: "Kelola akun, pesanan, dan pengaturan Anda di Kingz Sparepart Computer.",
      },
      { property: "og:title", content: "Profil | Kingz Sparepart Computer" },
      { property: "og:description", content: "Kelola akun, pesanan, dan pengaturan Anda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ProfilePage,
});

type UserData = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "pembeli";
  active: boolean;
};

const menuItems: { Icon: typeof Package; label: string; to?: "/keranjang" | "/pembayaran" }[] = [
  { Icon: Package, label: "Pesanan Saya", to: "/keranjang" },
  { Icon: Settings, label: "Pengaturan Akun" },
];

function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("kingz_auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.user) setUser(parsed.user);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("kingz_auth");
    setUser(null);
    toast.success("Berhasil keluar dari akun");
    navigate({ to: "/login" });
  };

  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-6 pb-28">
      <div className="mx-auto w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profil Akun</h1>
        </div>

        {user ? (
          <div className="bg-card rounded-lg border p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground shrink-0">
                {user.name ? user.name[0] : "U"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold truncate">{user.name}</p>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role === "admin" ? "Admin" : "Pembeli"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.phone || "No. HP belum diatur"}
                </p>
              </div>
            </div>

            {user.role === "admin" && (
              <div className="pt-2 border-t">
                <Link
                  to="/admin"
                  className="flex items-center justify-between w-full p-2.5 rounded-md bg-primary/10 text-primary font-medium text-xs hover:bg-primary/20 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4" />
                    Buka Dashboard Admin (Express &amp; PostgreSQL)
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-lg border p-5 shadow-sm text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Anda belum masuk ke akun Kingz Sparepart.
            </p>
            <div className="flex justify-center gap-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium"
              >
                <LogIn className="h-3.5 w-3.5" />
                Masuk
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 text-xs border bg-background px-4 py-2 rounded-md font-medium hover:bg-accent"
              >
                Daftar Akun
              </Link>
            </div>
          </div>
        )}

        <div className="bg-card rounded-lg border shadow-sm divide-y">
          {menuItems.map(({ Icon, label, to }) => {
            const content = (
              <div className="flex w-full items-center gap-3 px-4 py-4">
                <Icon aria-hidden className="text-muted-foreground" />
                <span className="flex-1 text-sm font-medium">{label}</span>
                <ChevronRight aria-hidden className="text-muted-foreground" />
              </div>
            );
            return to ? (
              <Link key={label} to={to} className="block hover:bg-muted/50 transition-colors">
                {content}
              </Link>
            ) : (
              <button
                key={label}
                type="button"
                onClick={() => toast.info("Fitur segera hadir")}
                className="block w-full text-left hover:bg-muted/50 transition-colors"
              >
                {content}
              </button>
            );
          })}
        </div>

        <Link
          to="/chat"
          className="flex items-center gap-3 rounded-lg border bg-card px-4 py-4 shadow-sm hover:bg-muted/50 transition-colors"
        >
          <MessageCircle aria-hidden className="text-muted-foreground" />
          <span className="flex-1 text-sm font-medium">Chat dengan Toko</span>
          <ChevronRight aria-hidden className="text-muted-foreground" />
        </Link>

        {user && (
          <Button
            variant="outline"
            className="w-full text-destructive border-destructive/20 hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut aria-hidden className="mr-1 h-4 w-4" />
            Keluar dari Akun
          </Button>
        )}
      </div>
    </main>
  );
}
