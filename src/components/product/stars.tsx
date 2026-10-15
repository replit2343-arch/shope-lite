import { Star } from 'lucide-react';

export function Stars({ gold = false, value = 5 }: { gold?: boolean; value?: number }) {
  return <span className={`stars${gold ? ' gold' : ''}`} aria-label={`${value} dari 5 bintang`}>{Array.from({ length: 5 }, (_, i) => <Star key={i} aria-hidden="true" style={i >= value ? { opacity: 0.25 } : undefined} />)}</span>;
}
