import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

type Category = "All" | "Wildlife" | "Lodge" | "Dining" | "Safari" | "Aerial";

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  category: Exclude<Category, "All">;
  span: "tall" | "wide" | "normal";
}

const images: GalleryImage[] = [
  { id: 1, src: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=80", alt: "Lion in golden savanna light", category: "Wildlife", span: "tall" },
  { id: 2, src: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=800&q=80", alt: "Luxury lodge exterior at sunset", category: "Lodge", span: "wide" },
  { id: 3, src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80", alt: "Fine dining bush dinner setup", category: "Dining", span: "normal" },
  { id: 4, src: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800&q=80", alt: "Safari vehicle at dawn", category: "Safari", span: "normal" },
  { id: 5, src: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=800&q=80", alt: "Aerial view of Mara River", category: "Aerial", span: "wide" },
  { id: 6, src: "https://images.unsplash.com/photo-1535338454528-1b5a7fb4930a?w=800&q=80", alt: "Elephant herd at waterhole", category: "Wildlife", span: "normal" },
  { id: 7, src: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80", alt: "Suite interior with savanna view", category: "Lodge", span: "tall" },
  { id: 8, src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80", alt: "Gourmet African cuisine plating", category: "Dining", span: "normal" },
  { id: 9, src: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=800&q=80", alt: "Leopard in acacia tree", category: "Wildlife", span: "normal" },
  { id: 10, src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80", alt: "Aerial savanna panorama", category: "Aerial", span: "tall" },
  { id: 11, src: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80", alt: "Infinity pool overlooking plains", category: "Lodge", span: "wide" },
  { id: 12, src: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800&q=80", alt: "Campfire dining under stars", category: "Dining", span: "tall" },
  { id: 13, src: "https://images.unsplash.com/photo-1534759926787-89fa60e09e88?w=800&q=80", alt: "Game drive at golden hour", category: "Safari", span: "normal" },
  { id: 14, src: "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=800&q=80", alt: "Giraffe silhouette at sunset", category: "Wildlife", span: "wide" },
  { id: 15, src: "https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=800&q=80", alt: "Hot air balloon over Mara", category: "Aerial", span: "normal" },
  { id: 16, src: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&q=80", alt: "Bush breakfast experience", category: "Safari", span: "normal" },
  { id: 17, src: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80", alt: "Lodge lounge at twilight", category: "Lodge", span: "normal" },
  { id: 18, src: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80", alt: "Cheetah in grassland", category: "Wildlife", span: "tall" },
];

const categories: Category[] = ["All", "Wildlife", "Lodge", "Dining", "Safari", "Aerial"];

const Gallery = () => {
  const [active, setActive] = useState<Category>("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = useMemo(
    () => (active === "All" ? images : images.filter((img) => img.category === active)),
    [active]
  );

  const openLightbox = (index: number) => setLightbox(index);
  const closeLightbox = () => setLightbox(null);

  const navigate = useCallback(
    (dir: 1 | -1) => {
      if (lightbox === null) return;
      setLightbox((lightbox + dir + filtered.length) % filtered.length);
    },
    [lightbox, filtered.length]
  );

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") navigate(1);
      if (e.key === "ArrowLeft") navigate(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [lightbox, navigate]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="container mx-auto text-center">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-primary font-body text-sm uppercase tracking-[0.3em] mb-4"
          >
            Visual Stories
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-light text-foreground mb-6"
          >
            The Gallery
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-body text-muted-foreground max-w-xl mx-auto text-lg"
          >
            Moments captured across the Mara — from dawn game drives to starlit dinners.
          </motion.p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="sticky top-[72px] z-30 bg-background/90 backdrop-blur-xl border-b border-border/30 py-4">
        <div className="container mx-auto px-6 flex items-center justify-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`relative px-5 py-2 rounded-full text-sm font-body tracking-wide transition-colors duration-300 ${
                active === cat
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {active === cat && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Masonry Grid */}
      <section className="py-12 px-6">
        <div className="container mx-auto">
          <motion.div
            layout
            className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {filtered.map((img, idx) => (
                <motion.div
                  key={img.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4, delay: idx * 0.03 }}
                  className="break-inside-avoid group cursor-pointer relative overflow-hidden rounded-xl"
                  onClick={() => openLightbox(idx)}
                >
                  <img
                    src={img.src}
                    alt={img.alt}
                    loading="lazy"
                    className={`w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
                      img.span === "tall"
                        ? "h-[480px]"
                        : img.span === "wide"
                        ? "h-[260px]"
                        : "h-[340px]"
                    }`}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-background/0 group-hover:bg-background/50 transition-colors duration-500 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center gap-2">
                      <ZoomIn className="w-6 h-6 text-foreground" />
                      <span className="text-xs font-body text-muted-foreground uppercase tracking-wider">
                        {img.category}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>

          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground font-body py-20">
              No images in this category yet.
            </p>
          )}
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-2xl flex items-center justify-center"
            onClick={closeLightbox}
          >
            {/* Close */}
            <button
              className="absolute top-6 right-6 text-muted-foreground hover:text-foreground transition-colors z-10"
              onClick={closeLightbox}
            >
              <X className="w-8 h-8" />
            </button>

            {/* Counter */}
            <div className="absolute top-6 left-6 text-muted-foreground font-body text-sm tracking-wider z-10">
              {lightbox + 1} / {filtered.length}
            </div>

            {/* Prev */}
            <button
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-card/60 hover:bg-card text-foreground transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); navigate(-1); }}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Image */}
            <motion.img
              key={filtered[lightbox].id}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.3 }}
              src={filtered[lightbox].src.replace("w=800", "w=1600")}
              alt={filtered[lightbox].alt}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Next */}
            <button
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 rounded-full bg-card/60 hover:bg-card text-foreground transition-colors z-10"
              onClick={(e) => { e.stopPropagation(); navigate(1); }}
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Caption */}
            <div className="absolute bottom-8 text-center w-full px-6">
              <p className="font-body text-foreground text-sm">{filtered[lightbox].alt}</p>
              <span className="text-xs text-primary uppercase tracking-widest font-body mt-1 inline-block">
                {filtered[lightbox].category}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Gallery;
