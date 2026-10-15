import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Package,
  Store,
  Users,
  CreditCard,
  MessageCircle,
  Shield,
  LogOut,
  Star,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AdminShop } from "@/components/admin/shop";
import { AdminProducts } from "@/components/admin/products";
import { AdminUsers } from "@/components/admin/users";
import { AdminPayments } from "@/components/admin/payments";
import { AdminChat } from "@/components/admin/chat";
import { AdminTestimonials } from "@/components/admin/testimonials";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin | Kingz Sparepart Computer" },
      {
        name: "description",
        content: "Kelola produk, user, metode pembayaran, dan chat toko Kingz Sparepart Computer.",
      },
      { property: "og:title", content: "Admin | Kingz Sparepart Computer" },
      { property: "og:description", content: "Kelola produk, user, pembayaran, dan chat toko." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

const sections = [
  { id: "toko", label: "Toko", Icon: Store },
  { id: "produk", label: "Produk", Icon: Package },
  { id: "user", label: "User", Icon: Users },
  { id: "pembayaran", label: "Pembayaran", Icon: CreditCard },
  { id: "chat", label: "Chat", Icon: MessageCircle },
  { id: "testimoni", label: "Testimoni", Icon: Star },
] as const;

type SectionId = (typeof sections)[number]["id"];

function AdminSidebar({
  active,
  onSelect,
}: {
  active: SectionId;
  onSelect: (id: SectionId) => void;
}) {
  const navigate = useNavigate();
  const logout = () => {
    toast.success("Berhasil keluar");
    navigate({ to: "/login" });
  };
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1.5 group-data-[collapsible=icon]:justify-center">
          <Shield className="h-5 w-5 text-primary" aria-hidden />
          <span className="text-sm font-semibold group-data-[collapsible=icon]:hidden">Admin</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Manajemen</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sections.map(({ id, label, Icon }) => (
                <SidebarMenuItem key={id}>
                  <SidebarMenuButton
                    isActive={active === id}
                    onClick={() => onSelect(id)}
                    tooltip={label}
                  >
                    <Icon aria-hidden />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Keluar">
              <LogOut aria-hidden />
              <span>Keluar</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function AdminPage() {
  const [active, setActive] = useState<SectionId>("produk");
  const currentLabel = sections.find((s) => s.id === active)?.label ?? "Admin";

  return (
    <SidebarProvider>
      <div className="flex min-h-[calc(100vh-80px)] w-full">
        <AdminSidebar active={active} onSelect={setActive} />
        <SidebarInset className="min-w-0 flex-1">
          <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger aria-label="Buka / tutup menu admin" />
              <h1 className="text-lg font-semibold">{currentLabel}</h1>
            </div>
          </header>
          <main className="px-4 py-6">
            <div className="mx-auto w-full max-w-5xl space-y-4">
              {active === "toko" && <AdminShop />}
              {active === "produk" && <AdminProducts />}
              {active === "user" && <AdminUsers />}
              {active === "pembayaran" && <AdminPayments />}
              {active === "chat" && <AdminChat />}
              {active === "testimoni" && <AdminTestimonials />}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
