import { MessageSquare, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShop } from "@/lib/shop-store";

export function Seller({ onAction }: { onAction: (action: "chat" | "store") => void }) {
  const shop = useShop();
  const stats = [
    ["Penilaian", shop.rating],
    ["Persentase Chat Dibalas", shop.chatRate],
    ["Bergabung", shop.joined],
    ["Produk", shop.products],
    ["Waktu Chat Dibalas", shop.chatTime],
    ["Pengikut", shop.followers],
  ];
  return (
    <section className="store-band" aria-label="Informasi toko">
      <div className="store-profile">
        <div className="store-avatar">
          <img src={shop.photo} alt={shop.name} />
          {shop.badge && <span className="star-badge">{shop.badge}</span>}
        </div>
        <div className="min-w-0">
          <h2 className="text-base font-medium">{shop.name}</h2>
          <p className="mb-2 text-muted-foreground">{shop.activeText}</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="commerceOutline" size="sm" onClick={() => onAction("chat")}>
              <MessageSquare />
              Chat Sekarang
            </Button>
            <Button variant="filter" size="sm" onClick={() => onAction("store")}>
              <Store />
              Kunjungi Toko
            </Button>
          </div>
        </div>
      </div>
      <dl className="store-stats">
        {stats.map(([label, value]) => (
          <div className="store-stat" key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
