import { useEffect, useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ProductGallery({ onShare, photos, title }: { onShare: () => void; photos: string[]; title: string }) {
  const [selected, setSelected] = useState(0);
  const [favorite, setFavorite] = useState(false);
  useEffect(() => setSelected(0), [photos]);
  return <div className="min-w-0">
    <img className="product-photo" src={photos[selected]} alt={`${title} - foto ${selected + 1}`} />
    <div className="gallery-thumbnails" aria-label="Galeri foto produk">
      {photos.map((photo, i) => <Button key={i} variant="ghost" className="gallery-thumbnail" data-active={selected === i} aria-label={`Lihat foto produk ${i + 1}`} aria-pressed={selected === i} onClick={() => setSelected(i)}><img src={photo} alt={`Tampak produk ${i + 1}`} /></Button>)}
    </div>
    <div className="gallery-footer">
      <div className="social-group"><span>Share:</span>
        <Button className="social-button" variant="ghost" aria-label="Bagikan lewat Messenger" title="Messenger" onClick={onShare}><MessageCircle /></Button>
        <Button className="social-button" variant="ghost" aria-label="Bagikan lewat Facebook" title="Facebook" onClick={onShare}><span className="font-bold">f</span></Button>
        <Button className="social-button pinterest" variant="ghost" aria-label="Bagikan lewat Pinterest" title="Pinterest" onClick={onShare}>p</Button>
        <Button className="social-button social-x" variant="ghost" aria-label="Bagikan lewat X" title="X" onClick={onShare}>𝕏</Button>
      </div>
      <Button variant="ghost" className="favorite-button" aria-pressed={favorite} onClick={() => setFavorite(!favorite)}><Heart className={favorite ? 'fill-primary' : ''} /> Favorit ({favorite ? 10 : 9})</Button>
    </div>
  </div>;
}