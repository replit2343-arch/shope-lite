import { useEffect, useRef, useState } from "react";
import { RefreshCw, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Message = { id: number; sender: "seller" | "me"; text: string; time: string };

export function AdminChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchChat = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setMessages(data);
        }
      }
    } catch (err) {
      console.warn("Gagal mengambil pesan chat:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChat();
    const interval = setInterval(fetchChat, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim()) return;
    const sendText = text.trim();
    setText("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "seller", text: sendText }),
      });
      if (res.ok) {
        const created = await res.json();
        setMessages((s) => [...s, created]);
      }
    } catch (err) {
      console.warn("Gagal membalas chat:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Live Chat Pelanggan</h2>
          <p className="text-xs text-muted-foreground">
            Pesan tersimpan di database PostgreSQL &amp; terhubung langsung ke pembeli.
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={fetchChat}
          disabled={loading}
          title="Segarkan Chat"
        >
          <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
        </Button>
      </div>

      <div className="bg-card flex h-[65vh] flex-col rounded-lg border shadow-sm">
        <div className="border-b px-4 py-3 flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Percakapan Toko &amp; Pembeli</p>
              <p className="text-[11px] text-muted-foreground">
                Tersimpan di tabel chat_messages PostgreSQL
              </p>
            </div>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Realtime Database
          </span>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto p-4" ref={scrollRef}>
          {messages.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              {loading ? "Memuat riwayat chat dari database..." : "Belum ada pesan."}
            </p>
          )}
          {messages.map((m) => {
            const isSeller = m.sender === "seller";
            return (
              <div
                key={m.id}
                className={cn("flex flex-col", isSeller ? "items-end" : "items-start")}
              >
                <span className="text-[10px] text-muted-foreground mb-1 px-1">
                  {isSeller ? "Admin Toko (Anda)" : "Pembeli"}
                </span>
                <div
                  className={cn(
                    "max-w-[75%] rounded-lg px-3.5 py-2 text-sm shadow-sm",
                    isSeller
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground border",
                  )}
                >
                  <p className="leading-relaxed">{m.text}</p>
                  <p className="mt-1 text-[10px] opacity-70 text-right">{m.time}</p>
                </div>
              </div>
            );
          })}
        </div>

        <form
          className="flex gap-2 border-t p-3 bg-card"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <Input
            placeholder="Tulis balasan sebagai Admin Toko..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button type="submit" aria-label="Kirim" disabled={!text.trim()}>
            <Send className="h-4 w-4 mr-1.5" />
            Kirim Balasan
          </Button>
        </form>
      </div>
    </div>
  );
}
