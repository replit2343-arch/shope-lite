import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { SendHorizonal } from 'lucide-react';
import { storePhoto } from '@/components/product/product-data';

export const Route = createFileRoute('/chat')({
  head: () => ({ meta: [
    { title: 'Chat Penjual | Kingz Sparepart Computer' },
    { name: 'description', content: 'Hubungi penjual Kingz Sparepart Computer langsung melalui chat untuk tanya stok dan kelengkapan produk.' },
    { property: 'og:title', content: 'Chat Penjual | Kingz Sparepart Computer' },
    { property: 'og:description', content: 'Chat langsung dengan penjual untuk tanya stok dan kelengkapan produk.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: ChatPage,
});

type Message = { id: number; from: 'seller' | 'me'; text: string; time: string };

const initialMessages: Message[] = [
  { id: 1, from: 'seller', text: 'Halo kak! Terima kasih sudah menghubungi Kingz Sparepart Computer. Ada yang bisa dibantu?', time: '10.02' },
  { id: 2, from: 'me', text: 'Halo, Adaptor Asus A19-090P2A ini ready stock?', time: '10.04' },
  { id: 3, from: 'seller', text: 'Ready kak, 100% original baru dan bergaransi 6 bulan. Bisa langsung checkout ya.', time: '10.05' },
];

function ChatPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState('');
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [messages]);

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.');
    setMessages(current => [...current, { id: current.length + 1, from: 'me', text, time }]);
    setDraft('');
  };

  return <div className="chat-page">
    <header className="chat-header">
      <img src={storePhoto} alt="Kingz Sparepart Computer" className="chat-store-avatar" />
      <div className="min-w-0">
        <p className="chat-store-name">Kingz Sparepart Computer</p>
        <p className="chat-store-status">Aktif 2 jam lalu</p>
      </div>
    </header>
    <div className="chat-thread" ref={threadRef} aria-label="Percakapan dengan penjual">
      {messages.map(message => (
        <div key={message.id} className={`chat-row chat-row-${message.from}`}>
          <div className={`chat-bubble chat-bubble-${message.from}`}>
            {message.text}
            <span className="chat-time">{message.time}</span>
          </div>
        </div>
      ))}
    </div>
    <div className="chat-composer">
      <input
        aria-label="Tulis pesan"
        className="chat-input"
        placeholder="Tulis pesan..."
        value={draft}
        onChange={event => setDraft(event.target.value)}
        onKeyDown={event => { if (event.key === 'Enter') send(); }}
      />
      <button type="button" className="chat-send" aria-label="Kirim pesan" disabled={!draft.trim()} onClick={send}>
        <SendHorizonal size={20} aria-hidden />
      </button>
    </div>
  </div>;
}
