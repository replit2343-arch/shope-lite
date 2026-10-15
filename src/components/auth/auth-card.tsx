import { Link } from '@tanstack/react-router';
import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Field = { name: string; label: string; type: string; placeholder: string };

export function AuthCard({ mode }: { mode: 'login' | 'register' }) {
  const isLogin = mode === 'login';
  const fields: Field[] = isLogin
    ? [
        { name: 'email', label: 'Email', type: 'email', placeholder: 'nama@email.com' },
        { name: 'password', label: 'Kata sandi', type: 'password', placeholder: 'Minimal 6 karakter' },
      ]
    : [
        { name: 'name', label: 'Nama lengkap', type: 'text', placeholder: 'Nama Anda' },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'nama@email.com' },
        { name: 'phone', label: 'No. HP', type: 'tel', placeholder: '08xxxxxxxxxx' },
        { name: 'password', label: 'Kata sandi', type: 'password', placeholder: 'Minimal 6 karakter' },
        { name: 'confirm', label: 'Ulangi kata sandi', type: 'password', placeholder: 'Ketik ulang kata sandi' },
      ];
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get('password') ?? '');
    if (password.length < 6) { toast.error('Kata sandi minimal 6 karakter'); return; }
    if (!isLogin && password !== String(form.get('confirm') ?? '')) { toast.error('Kata sandi tidak sama'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(isLogin ? 'Berhasil masuk' : 'Akun berhasil dibuat');
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-4 py-10 pb-28">
      <div className="w-full max-w-sm bg-card rounded-lg border p-6 shadow-sm">
        <p className="text-primary font-bold text-sm">Kingz Sparepart Computer</p>
        <h1 className="text-2xl font-bold mt-1">{isLogin ? 'Masuk' : 'Daftar Akun'}</h1>
        <p className="text-muted-foreground mt-1 mb-5">
          {isLogin ? 'Masuk untuk belanja dan chat dengan penjual.' : 'Buat akun untuk mulai belanja.'}
        </p>
        <form onSubmit={submit} className="space-y-4">
          {fields.map(f => (
            <div key={f.name} className="space-y-1.5">
              <Label htmlFor={f.name}>{f.label}</Label>
              <Input id={f.name} name={f.name} type={f.type} placeholder={f.placeholder} required />
            </div>
          ))}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Memproses...' : isLogin ? 'Masuk' : 'Daftar'}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground mt-5">
          {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
          <Link to={isLogin ? '/register' : '/login'} className="text-primary font-bold">
            {isLogin ? 'Daftar' : 'Masuk'}
          </Link>
        </p>
      </div>
    </div>
  );
}
