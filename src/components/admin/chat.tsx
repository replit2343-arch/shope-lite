import { useEffect, useRef, useState } from "react";
import { RefreshCw, Send, User, Edit2, Trash2, Check, X, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Message = { id: number; sender: "seller" | "me"; text: string; time: string };

export function AdminChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [senderType, setSenderType] = useState<"seller" | "me">("seller");

  // Edit state
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [editText, setEditText] = useState("");
  const [editSender, setEditSender] = useState<"seller" | "me">("seller");

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

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim()) return;
    const sendText = text.trim();
    setText("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: senderType, text: sendText }),
      });
      if (res.ok) {
        const created = await res.json();
        setMessages((s) => [...s, created]);
        toast.success("Pesan berhasil dikirim");
      } else {
        toast.error("Gagal mengirim pesan");
      }
    } catch (err) {
      console.warn("Gagal mengirim chat:", err);
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  const handleUpdate = async () => {
    if (!editingMessage || !editText.trim()) return;
    try {
      const res = await fetch(`/api/chat/${editingMessage.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editText.trim(), sender: editSender }),
      });
      if (res.ok) {
        const updated = await res.json();
        setMessages((s) => s.map((m) => (m.id === updated.id ? updated : m)));
        toast.success("Pesan berhasil diperbarui");
        setEditingMessage(null);
      } else {
        toast.error("Gagal memperbarui pesan");
      }
    } catch (err) {
      console.warn("Error updating message:", err);
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pesan ini?")) return;
    try {
      const res = await fetch(`/api/chat/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMessages((s) => s.filter((m) => m.id !== id));
        toast.success("Pesan berhasil dihapus");
      } else {
        toast.error("Gagal menghapus pesan");
      }
    } catch (err) {
      console.warn("Error deleting message:", err);
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Manajemen Live Chat (CRUD)</h2>
          <p className="text-xs text-muted-foreground">
            Admin dapat membuat, membaca, memperbarui, dan menghapus pesan antara toko dan pembeli.
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
              <p className="text-sm font-semibold">Panel Percakapan (Admin CRUD)</p>
              <p className="text-[11px] text-muted-foreground">
                Tersimpan di tabel chat_messages PostgreSQL
              </p>
            </div>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            CRUD Active
          </span>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4" ref={scrollRef}>
          {messages.length === 0 && (
            <p className="p-6 text-center text-sm text-muted-foreground">
              {loading ? "Memuat riwayat chat..." : "Belum ada pesan."}
            </p>
          )}
          {messages.map((m) => {
            const isSeller = m.sender === "seller";
            return (
              <div
                key={m.id}
                className={cn("flex flex-col group", isSeller ? "items-end" : "items-start")}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {isSeller ? "Admin Toko (Seller)" : "Pembeli (Customer)"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">• {m.time}</span>
                  {/* CRUD Action buttons */}
                  <div className="opacity-0 group-hover:opacity-150 transition-opacity flex items-center gap-1 ml-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMessage(m);
                        setEditText(m.text);
                        setEditSender(m.sender);
                      }}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit Pesan"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(m.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Hapus Pesan"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div
                  className={cn(
                    "max-w-[75%] rounded-lg px-3.5 py-2 text-sm shadow-sm relative group/bubble",
                    isSeller
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground border",
                  )}
                >
                  <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>
                  <div className="absolute top-1 right-1 opacity-0 group-hover/bubble:opacity-100 transition-opacity flex items-center gap-0.5 bg-background/80 backdrop-blur-sm rounded p-0.5 border shadow-xs">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingMessage(m);
                        setEditText(m.text);
                        setEditSender(m.sender);
                      }}
                      className="p-1 text-foreground hover:text-blue-600"
                      title="Edit"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(m.id)}
                      className="p-1 text-foreground hover:text-red-600"
                      title="Hapus"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <form
          className="flex flex-col sm:flex-row gap-2 border-t p-3 bg-card"
          onSubmit={sendMessage}
        >
          <div className="w-full sm:w-44">
            <Select
              value={senderType}
              onValueChange={(val) => setSenderType(val as "seller" | "me")}
            >
              <SelectTrigger className="h-10 text-xs">
                <SelectValue placeholder="Kirim sebagai..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="seller">Sebagai Admin (Seller)</SelectItem>
                <SelectItem value="me">Sebagai Pembeli</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 flex gap-2">
            <Input
              placeholder={
                senderType === "seller"
                  ? "Tulis balasan sebagai Admin Toko..."
                  : "Tulis pesan simulasi sebagai Pembeli..."
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <Button type="submit" aria-label="Kirim" disabled={!text.trim()}>
              <Send className="h-4 w-4 mr-1.5" />
              Kirim
            </Button>
          </div>
        </form>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingMessage} onOpenChange={(open) => !open && setEditingMessage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pesan Chat</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Pengirim</label>
              <Select
                value={editSender}
                onValueChange={(val) => setEditSender(val as "seller" | "me")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="seller">Admin Toko (Seller)</SelectItem>
                  <SelectItem value="me">Pembeli (Customer)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium">Isi Pesan</label>
              <textarea
                className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingMessage(null)}>
              Batal
            </Button>
            <Button onClick={handleUpdate}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
