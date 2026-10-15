import { createFileRoute, Link } from '@tanstack/react-router';
import { toast } from 'sonner';
import {
  Package,
  Settings,
  LogOut,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/profile')({
  head: () => ({ meta: [
    { title: 'Profil | Kingz Sparepart Computer' },
    { name: 'description', content: 'Kelola akun, pesanan, dan pengaturan Anda di Kingz Sparepart Computer.' },
    { property: 'og:title', content: 'Profil | Kingz Sparepart Computer' },
    { property: 'og:description', content: 'Kelola akun, pesanan, dan pengaturan Anda.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: ProfilePage,
});

const menuItems: { Icon: typeof Package; label: string; to?: '/keranjang' | '/pembayaran' }[] = [
  { Icon: Package, label: 'Pesanan Saya', to: '/keranjang' },
  { Icon: Settings, label: 'Pengaturan Akun' },
];

function ProfilePage() {
  return (
    <main className="min-h-[calc(100vh-80px)] px-4 py-6 pb-28">
      <div className="mx-auto w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold">Profil</h1>

        <div className="bg-card rounded-lg border p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
              B
            </div>
            <div className="min-w-0">
              <p className="font-bold truncate">Budi Santoso</p>
              <p className="text-sm text-muted-foreground truncate">budi@email.com</p>
              <p className="text-sm text-muted-foreground truncate">0812-3456-7890</p>
            </div>
          </div>
        </div>

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
                onClick={() => toast.info('Fitur segera hadir')}
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

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            toast.success('Berhasil keluar');
          }}
        >
          <LogOut aria-hidden />
          Keluar
        </Button>
      </div>

    </main>
  );
}

