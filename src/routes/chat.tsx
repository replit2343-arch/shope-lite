import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { SendHorizonal } from "lucide-react";
import { storePhoto } from "@/components/product/product-data";
import { useShop } from "@/lib/shop-store";

import { getChatServerData } from "@/lib/server-store";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Chat Penjual | Kingz Sparepart Computer" },
      {
        name: "description",
        content:
          "Hubungi penjual Kingz Sparepart Computer langsung melalui chat untuk tanya stok dan kelengkapan produk.",
      },
      { property: "og:title", content: "Chat Penjual | Kingz Sparepart Computer" },
      {
        property: "og:description",
        content: "Chat langsung dengan penjual untuk tanya stok dan kelengkapan produk.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async () => {
    return await getChatServerData();
  },
  component: ChatPage,
});

type Message = { id: number; from: "seller" | "me"; text: string; time: string };

function ChatPage() {
  const shop = useShop();
  const loaderData = Route.useLoaderData();
  const initial =
    Array.isArray(loaderData) && loaderData.length > 0
      ? loaderData.map(
          (m: { id: number; sender?: "seller" | "me"; text: string; time: string }) => ({
            id: m.id,
            from: (m.sender || "seller") as "seller" | "me",
            text: m.text,
            time: m.time,
          }),
        )
      : [];
  const [messages, setMessages] = useState<Message[]>(initial);
  const [draft, setDraft] = useState("");
  const threadRef = useRef<HTMLDivElement>(null);

  const fetchMessages = () => {
    fetch("/api/chat")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMessages(
            data.map((m: { id: number; sender?: "seller" | "me"; text: string; time: string }) => ({
              id: m.id,
              from: m.sender || "seller",
              text: m.text,
              time: m.time,
            })),
          );
        }
      })
      .catch((e) => console.warn(e));
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [messages]);

  const send = async () => {
    const text = draft.trim();
    if (!text) return;
    const time = new Date()
      .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      .replace(":", ".");
    const optimisticId = Date.now();
    setMessages((current) => [...current, { id: optimisticId, from: "me", text, time }]);
    setDraft("");

    try {
      await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender: "me", text }),
      });

      // Poll response from seller after short delay
      setTimeout(() => {
        fetchMessages();
      }, 1200);
    } catch (e) {
      console.warn("Error sending chat:", e);
    }
  };

  return (
    <div className="chat-page">
      <header className="chat-header">
        <img src={shop.photo || storePhoto} alt={shop.name} className="chat-store-avatar" />
        <div className="min-w-0">
          <p className="chat-store-name">{shop.name}</p>
          <p className="chat-store-status">{shop.activeText || "Aktif 2 jam lalu"}</p>
        </div>
      </header>
      <div className="chat-thread" ref={threadRef} aria-label="Percakapan dengan penjual">
        {messages.map((message) => (
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
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") send();
          }}
        />
        <button
          type="button"
          className="chat-send"
          aria-label="Kirim pesan"
          disabled={!draft.trim()}
          onClick={send}
        >
          <SendHorizonal size={20} aria-hidden />
        </button>
      </div>
    </div>
  );
}
