import { useState } from 'react';
import { ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Msg = { from: 'user' | 'admin'; text: string; time: string };
type Thread = { id: number; name: string; unread: number; messages: Msg[] };
const now = () => new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

export function AdminChat() {
  const [threads, setThreads] = useState<Thread[]>([
    { id: 1, name: 'Budi Santoso', unread: 2, messages: [
      { from: 'user', text: 'Halo kak, adaptor Asus masih ada?', time: '09:12' },
      { from: 'user', text: 'Bisa kirim hari ini?', time: '09:13' },
    ] },
    { id: 2, name: 'Siti Aminah', unread: 0, messages: [
      { from: 'user', text: 'Garansinya berapa lama?', time: 'Kemarin' },
      { from: 'admin', text: 'Garansi 1 bulan kak 🙏', time: 'Kemarin' },
    ] },
  ]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [text, setText] = useState('');
  const active = threads.find((t) => t.id === activeId);

  const openThread = (id: number) => {
    setActiveId(id);
    setThreads((s) => s.map((t) => (t.id === id ? { ...t, unread: 0 } : t)));
  };
  const send = () => {
    if (!text.trim() || !active) return;
    setThreads((s) => s.map((t) => (t.id === active.id ? { ...t, messages: [...t.messages, { from: 'admin', text: text.trim(), time: now() }] } : t)));
    setText('');
  };

  if (active) {
    return (
      <div className="bg-card flex h-[60vh] flex-col rounded-lg border shadow-sm">
        <div className="flex items-center gap-2 border-b p-3">
          <Button size="icon" variant="ghost" aria-label="Kembali" onClick={() => setActiveId(null)}><ArrowLeft /></Button>
          <p className="font-medium">{active.name}</p>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {active.messages.map((m, i) => (
            <div key={i} className={cn('flex', m.from === 'admin' ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[75%] rounded-lg px-3 py-2 text-sm', m.from === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                <p>{m.text}</p>
                <p className="mt-1 text-[10px] opacity-70">{m.time}</p>
              </div>
            </div>
          ))}
        </div>
        <form className="flex gap-2 border-t p-3" onSubmit={(e) => { e.preventDefault(); send(); }}>
          <Input placeholder="Tulis balasan..." value={text} onChange={(e) => setText(e.target.value)} />
          <Button type="submit" size="icon" aria-label="Kirim"><Send /></Button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Chat Pelanggan</h2>
      <div className="bg-card divide-y rounded-lg border shadow-sm">
        {threads.map((t) => {
          const last = t.messages[t.messages.length - 1];
          return (
            <button key={t.id} className="flex w-full items-center gap-3 p-4 text-left hover:bg-muted/50" onClick={() => openThread(t.id)}>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">{t.name[0]}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{t.name}</p>
                <p className="truncate text-xs text-muted-foreground">{last?.from === 'admin' ? 'Anda: ' : ''}{last?.text}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-muted-foreground">{last?.time}</span>
                {t.unread > 0 && <Badge>{t.unread}</Badge>}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
