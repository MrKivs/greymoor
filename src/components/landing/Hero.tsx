import { Button } from "@/components/ui/button";
import { ChevronDown, Play } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Hero = () => {
  const navigate = useNavigate();
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Video background */}
      <div className="absolute inset-0 z-0">
        {/* Fallback image */}
        <img
          src="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&q=85"
          alt="Safari landscape"
          className={`w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? "opacity-0" : "opacity-100"}`}
        />
        <video
          autoPlay
          muted
          loop
          playsInline
          onLoadedData={() => setVideoLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? "opacity-100" : "opacity-0"}`}
          poster="https://images.unsplash.com/photo-1516426122078-c23e76319801?w=1920&q=85"
        >
          <source
            src="https://videos.pexels.com/video-files/5548025/5548025-uhd_2560_1440_30fps.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-transparent to-background/40 z-[1]" />

      {/* Grain texture */}
      <div className="absolute inset-0 z-[2] opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-[3] h-full flex flex-col items-center justify-center text-center px-6">
        {/* Location tag */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-xs sm:text-sm uppercase tracking-[0.4em] text-primary font-body mb-6"
        >
          Masai Mara · Amboseli · Samburu
        </motion.p>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="font-display text-5xl sm:text-7xl lg:text-8xl font-light leading-[0.95] mb-4"
        >
          Where the Wild
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="font-display text-5xl sm:text-7xl lg:text-8xl font-light leading-[0.95] mb-8 text-gradient-gold"
        >
          Meets Luxury
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="font-body text-muted-foreground text-base sm:text-lg max-w-xl mb-10 leading-relaxed"
        >
          Exclusive safari lodges in East Africa's most spectacular landscapes. 
          Curated adventures, unforgettable encounters, timeless luxury.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button 
            variant="hero" 
            size="lg" 
            className="text-base px-10 h-12"
            onClick={() => navigate("/book")}
          >
            Book Your Escape
          </Button>
          <Button
            variant="hero-outline"
            size="lg"
            className="text-base px-10 h-12"
            onClick={() => {
              const el = document.querySelector("#safaris");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <Play className="w-4 h-4 mr-2" />
            Explore Safaris
          </Button>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[3] flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-body">Scroll</span>
        <ChevronDown className="w-5 h-5 text-primary/60" />
      </motion.div>
    </section>
  );
};

export default Hero;
