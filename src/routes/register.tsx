import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/auth/auth-card";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Daftar Akun | Kingz Sparepart Computer" },
      {
        name: "description",
        content: "Buat akun baru di Kingz Sparepart Computer untuk mulai belanja.",
      },
      { property: "og:title", content: "Daftar Akun | Kingz Sparepart Computer" },
      { property: "og:description", content: "Buat akun baru di Kingz Sparepart Computer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AuthCard mode="register" />,
});
