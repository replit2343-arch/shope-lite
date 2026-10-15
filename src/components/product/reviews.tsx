import { useState } from "react";
import { ChevronLeft, ChevronRight, MoreVertical, ThumbsUp, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTestimonials } from "@/lib/shop-store";
import { Stars } from "./stars";

export function ProductReviews({
  onMedia,
  onReport,
}: {
  onMedia: (url: string) => void;
  onReport: () => void;
}) {
  const reviews = useTestimonials();
  const [filter, setFilter] = useState("Semua");
  const [helpful, setHelpful] = useState<number[]>([]);
  const countFor = (star: number) => reviews.filter((r) => r.rating === star).length;
  const withComment = reviews.filter((r) => r.comment).length;
  const withMedia = reviews.filter((r) => r.media).length;
  const filters = [
    "Semua",
    `5 Bintang (${countFor(5)})`,
    `4 Bintang (${countFor(4)})`,
    `3 Bintang (${countFor(3)})`,
    `2 Bintang (${countFor(2)})`,
    `1 Bintang (${countFor(1)})`,
    `Dengan Komentar (${withComment})`,
    `Dengan Media (${withMedia})`,
  ];
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 5;
  const filtered = reviews.filter(
    (review) =>
      filter === "Semua" ||
      (filter.startsWith("5 Bintang") && review.rating === 5) ||
      (filter.startsWith("4 Bintang") && review.rating === 4) ||
      (filter.startsWith("3 Bintang") && review.rating === 3) ||
      (filter.startsWith("2 Bintang") && review.rating === 2) ||
      (filter.startsWith("1 Bintang") && review.rating === 1) ||
      (filter.startsWith("Dengan Komentar") && review.comment) ||
      (filter.startsWith("Dengan Media") && review.media),
  );
  return (
    <section className="content-band" id="penilaian" aria-label="Penilaian produk">
      <h2 className="review-heading">Penilaian Produk</h2>
      <div className="review-summary">
        <div className="review-score">
          <strong>{avg.toFixed(1)}</strong>
          <span> dari 5</span>
          <Stars value={Math.round(avg)} />
        </div>
        <div className="review-filters">
          {filters.map((item) => (
            <Button
              key={item}
              variant="filter"
              className="button"
              data-active={filter === item}
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
            >
              {item}
            </Button>
          ))}
        </div>
      </div>
      <div>
        {filtered.length === 0 ? (
          <p className="empty-reviews">Belum ada penilaian untuk filter ini.</p>
        ) : (
          filtered.map((review) => (
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
                {review.comment && <p className="mt-4">{review.comment}</p>}
                {review.media && (
                  <Button
                    variant="ghost"
                    className="mt-3 h-auto rounded-none p-0"
                    aria-label="Lihat foto ulasan"
                    onClick={() => onMedia(review.media)}
                  >
                    <img
                      className="review-media"
                      src={review.media}
                      alt={`Foto dari ${review.name}`}
                      loading="lazy"
                    />
                  </Button>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    className={`h-6 gap-1 p-0 font-normal ${helpful.includes(review.id) ? "text-primary" : "text-label"}`}
                    aria-pressed={helpful.includes(review.id)}
                    onClick={() =>
                      setHelpful((current) =>
                        current.includes(review.id)
                          ? current.filter((id) => id !== review.id)
                          : [...current, review.id],
                      )
                    }
                  >
                    <ThumbsUp
                      className={helpful.includes(review.id) ? "fill-primary" : "fill-label/40"}
                    />
                    {helpful.includes(review.id) ? "Membantu (1)" : "Membantu?"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-label"
                    aria-label={`Laporkan ulasan ${review.name}`}
                    title="Laporkan ulasan"
                    onClick={onReport}
                  >
                    <MoreVertical />
                  </Button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
      <div className="review-pagination">
        <Button variant="ghost" size="icon" aria-label="Halaman sebelumnya" disabled>
          <ChevronLeft />
        </Button>
        <Button variant="commerce" size="icon" aria-label="Halaman 1" aria-current="page">
          1
        </Button>
        <Button variant="ghost" size="icon" aria-label="Halaman berikutnya" disabled>
          <ChevronRight />
        </Button>
      </div>
    </section>
  );
}
