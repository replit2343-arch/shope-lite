import { createFileRoute } from "@tanstack/react-router";
import { ThumbsUp, UserRound } from "lucide-react";
import { initTestimonialsData, useTestimonials } from "@/lib/shop-store";
import { getTestimonialsServerData } from "@/lib/server-store";
import { Stars } from "@/components/product/stars";

export const Route = createFileRoute("/testimoni")({
  head: () => ({
    meta: [
      { title: "Testimoni Pembeli | Kingz Sparepart Computer" },
      {
        name: "description",
        content:
          "Testimoni dan penilaian pembeli untuk produk Kingz Sparepart Computer. Rating 5.0 dari pembeli terverifikasi.",
      },
      { property: "og:title", content: "Testimoni Pembeli | Kingz Sparepart Computer" },
      {
        property: "og:description",
        content: "Rating 5.0 dari pembeli terverifikasi Kingz Sparepart Computer.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async () => {
    const data = await getTestimonialsServerData();
    if (data && Array.isArray(data) && data.length > 0) {
      initTestimonialsData(data);
    }
    return data;
  },
  component: TestimoniPage,
});

function TestimoniPage() {
  const loaderData = Route.useLoaderData();
  const storeReviews = useTestimonials();

  if (loaderData && Array.isArray(loaderData) && loaderData.length > 0) {
    initTestimonialsData(loaderData);
  }

  const reviews =
    loaderData && Array.isArray(loaderData) && loaderData.length > 0 ? loaderData : storeReviews;
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 5;
  return (
    <main className="testimoni-page">
      <section className="content-band" aria-label="Testimoni pembeli">
        <h1 className="review-heading">Testimoni Pembeli</h1>
        <div className="review-summary">
          <div className="review-score">
            <strong>{avg.toFixed(1)}</strong>
            <span> dari 5</span>
            <Stars value={Math.round(avg)} />
          </div>
          <p className="testimoni-caption">
            Semua testimoni berasal dari pembeli terverifikasi yang membeli produk di toko ini.
          </p>
        </div>
        <div>
          {reviews.map((review) => (
            <article className="review-row" key={review.id}>
              {review.avatar ? (
                <img
                  className="review-avatar"
                  src={review.avatar}
                  alt={`Foto ${review.name}`}
                  loading="lazy"
                />
              ) : (
                <div className="review-avatar review-avatar-placeholder">
                  <UserRound size={26} />
                </div>
              )}
              <div className="min-w-0">
                <p className="mb-1 text-xs">{review.name}</p>
                <Stars value={review.rating} />
                {review.date && <p className="mt-1 text-xs text-muted-foreground">{review.date}</p>}
                {review.comment ? (
                  <p className="mt-4">{review.comment}</p>
                ) : (
                  <p className="mt-4 text-muted-foreground">
                    Pembeli memberi penilaian tanpa komentar.
                  </p>
                )}
                {review.media && (
                  <img
                    className="review-media"
                    src={review.media}
                    alt="Foto produk dari pembeli"
                    loading="lazy"
                  />
                )}
                <div className="mt-4 flex items-center">
                  <ThumbsUp className="mr-1 fill-label/40 text-label" size={14} aria-hidden />
                  <span className="text-xs text-label">Membantu?</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
