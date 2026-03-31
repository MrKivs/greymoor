import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import ImageReveal from "@/components/animations/ImageReveal";

const wildlife = [
  { src: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=800&q=85", alt: "Lion close-up", label: "The King" },
  { src: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=800&q=85", alt: "Elephant herd", label: "Giants of Africa" },
  { src: "https://images.unsplash.com/photo-1535338454528-1b5c57e4fa28?w=600&q=85", alt: "Cheetah running", label: "Speed & Grace" },
  { src: "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=600&q=85", alt: "Giraffe at sunset", label: "Silhouettes" },
  { src: "https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800&q=85", alt: "Zebra herd", label: "Patterns of the Wild" },
  { src: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=600&q=85", alt: "Leopard in tree", label: "The Shadow Hunter" },
];

const WildlifeGallery = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 px-6 grain-overlay relative overflow-hidden" ref={ref}>
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="text-sm uppercase tracking-[0.3em] text-primary font-body mb-4"
          >
            The Big Five & Beyond
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-light mb-6"
          >
            Encounters That <span className="text-gradient-gold">Define a Lifetime</span>
          </motion.h2>
        </div>

        {/* Masonry grid */}
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {wildlife.map((item, i) => (
            <motion.div
              key={item.alt}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              className="break-inside-avoid group relative overflow-hidden rounded-xl"
            >
              <ImageReveal>
                <img
                  src={item.src}
                  alt={item.alt}
                  className="w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </ImageReveal>
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                <p className="font-display text-lg text-foreground">{item.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WildlifeGallery;
