import { Fragment } from 'react';
import { ChevronRight } from 'lucide-react';
import { emptySpecs, type Product } from '@/lib/shop-store';

export function ProductDetails({ product }: { product?: Product | undefined }) {
  const s = product?.specs ?? emptySpecs;
  const specs = [['Merek', s.brand], ['Masa Garansi', s.warrantyPeriod], ['Jenis Garansi', s.warrantyType], ['Produk Custom', s.custom], ['No.Sertifikat (SNI,K3L,UTTP)', s.certificate], ['Asal Produk', s.origin], ['Dikirim Dari', s.shipFrom]];
  const cats = s.category.split('>').map((c) => c.trim()).filter(Boolean);
  const paragraphs = s.description.split(/\n\s*\n/).filter((p) => p.trim());
  return <section className="content-band" aria-label="Detail produk">
    <h2 className="section-heading">Spesifikasi Produk</h2>
    <dl className="specifications"><div className="spec-row"><dt>Kategori</dt><dd className="category-path">{cats.map((c, i) => <Fragment key={i}>{i > 0 && <ChevronRight />}<span>{c}</span></Fragment>)}</dd></div>
      {specs.map(([label, value]) => <div className="spec-row" key={label}><dt>{label}</dt><dd className={label === 'Merek' ? 'text-link' : ''}>{value || '-'}</dd></div>)}
    </dl>
    <h2 className="section-heading">Deskripsi Produk</h2>
    <div className="product-description">
      {paragraphs.map((p, i) => <p key={i} className="whitespace-pre-line">{p.trim()}</p>)}
    </div>
  </section>;
}
