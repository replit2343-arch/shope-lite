import { createFileRoute } from "@tanstack/react-router";
import { AuthCard } from "@/components/auth/auth-card";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Masuk | Kingz Sparepart Computer" },
      {
        name: "description",
        content: "Masuk ke akun Kingz Sparepart Computer untuk belanja sparepart laptop.",
      },
      { property: "og:title", content: "Masuk | Kingz Sparepart Computer" },
      { property: "og:description", content: "Masuk ke akun Kingz Sparepart Computer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => <AuthCard mode="login" />,
});
