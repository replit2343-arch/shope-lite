import { Link, useLocation } from '@tanstack/react-router';
import { Home, MessageCircle, Star, User } from 'lucide-react';

const items = [
  { to: '/', label: 'Beranda', Icon: Home },
  { to: '/chat', label: 'Chat', Icon: MessageCircle },
  { to: '/testimoni', label: 'Testimoni', Icon: Star },
  { to: '/profile', label: 'Profil', Icon: User },
] as const;

export function BottomNav() {
  const { pathname } = useLocation();
  if (pathname.startsWith('/admin')) return null;
  return (

    <nav className="bottom-nav" aria-label="Navigasi utama">
      {items.map(({ to, label, Icon }) => {
        const active = to === '/' ? pathname === '/' : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            className={`bottom-nav-item${active ? ' is-active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            <Icon aria-hidden />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
