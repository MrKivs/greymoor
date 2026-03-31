import { MapPin, Clock, Users, Mountain, Map, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";

interface SafariPackage {
  id: string;
  name: string;
  duration_days: number;
  max_group_size: number;
  price_per_person: number;
  difficulty_level: string;
  cover_image: string | null;
  highlights: string[] | null;
  destinations: unknown;
}

const difficultyColor: Record<string, string> = {
  easy: "text-green-400",
  moderate: "text-primary",
  challenging: "text-accent",
  extreme: "text-destructive",
};

const SafariPackages = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [packages, setPackages] = useState<SafariPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      const { data } = await supabase
        .from("safari_packages")
        .select("id, name, duration_days, max_group_size, price_per_person, difficulty_level, cover_image, highlights, destinations")
        .eq("status", "active")
        .order("price_per_person", { ascending: true })
        .limit(8);
      if (data) setPackages(data);
      setLoading(false);
    };
    fetchPackages();
  }, []);

  const getDestination = (destinations: unknown): string => {
    if (Array.isArray(destinations) && destinations.length > 0) {
      const first = destinations[0];
      if (typeof first === "object" && first !== null && "name" in first) {
        return (first as { name: string }).name;
      }
      if (typeof first === "string") return first;
    }
    return "East Africa";
  };

  return (
    <section id="safaris" className="section-padding grain-overlay relative" ref={ref}>
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="text-sm uppercase tracking-[0.3em] text-primary font-body mb-4"
          >
            Safari Adventures
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-light mb-6"
          >
            Curated Expeditions
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground max-w-2xl mx-auto font-body leading-relaxed"
          >
            Handcrafted safari itineraries led by expert guides through East Africa's
            most breathtaking landscapes.
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-3 mt-6"
          >
            <Link to="/safaris/map">
              <Button variant="hero-outline" size="sm">
                <Map className="w-4 h-4 mr-2" /> Interactive Map
              </Button>
            </Link>
            <Button variant="hero" size="sm" onClick={() => navigate("/book")}>
              <Compass className="w-4 h-4 mr-2" /> Book a Safari
            </Button>
          </motion.div>
        </div>

        {loading ? (
          <div className="grid lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div key={i} className="glass-card h-72 animate-pulse bg-muted/20" />
            ))}
          </div>
        ) : (
          <>
            {/* Featured (first 2 large) */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {packages.slice(0, 2).map((pkg, i) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.12 }}
                  className="glass-card-hover overflow-hidden group relative cursor-pointer"
                  onClick={() => navigate("/book")}
                >
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={pkg.cover_image || "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=85"}
                      alt={pkg.name}
                      className="w-full h-full object-cover img-zoom"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    <div className="absolute top-4 left-4 flex gap-2 z-10">
                      <span className="glass-card px-3 py-1.5 text-xs font-body font-medium text-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {getDestination(pkg.destinations)}
                      </span>
                      <span className="glass-card px-3 py-1.5 text-xs font-body font-medium text-primary">
                        ★ Featured
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                      <h3 className="font-display text-2xl font-semibold mb-2">{pkg.name}</h3>
                      <div className="flex flex-wrap gap-3 mb-3 text-xs text-foreground/70 font-body">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {pkg.duration_days} Days</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Max {pkg.max_group_size}</span>
                        <span className={`flex items-center gap-1 ${difficultyColor[pkg.difficulty_level] || "text-muted-foreground"}`}>
                          <Mountain className="w-3.5 h-3.5" /> {pkg.difficulty_level}
                        </span>
                      </div>
                      <div className="flex items-end justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          {pkg.highlights?.slice(0, 3).map((h) => (
                            <span key={h} className="text-[10px] px-2 py-0.5 rounded-full border border-foreground/20 text-foreground/70 font-body">{h}</span>
                          ))}
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-display font-semibold">{formatPrice(pkg.price_per_person)}</span>
                          <span className="text-xs text-muted-foreground font-body block">/person</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Rest in compact grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.slice(2).map((pkg, i) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className="glass-card-hover overflow-hidden group flex flex-col cursor-pointer"
                  onClick={() => navigate("/book")}
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={pkg.cover_image || "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800&q=85"}
                      alt={pkg.name}
                      className="w-full h-full object-cover img-zoom"
                      loading="lazy"
                    />
                    <div className="absolute top-3 left-3 z-10">
                      <span className="glass-card px-2 py-1 text-[10px] font-body font-medium text-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {getDestination(pkg.destinations)}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-display text-lg font-semibold mb-2">{pkg.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-3 text-xs text-muted-foreground font-body">
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {pkg.duration_days}D</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {pkg.max_group_size}</span>
                        <span className={`flex items-center gap-1 ${difficultyColor[pkg.difficulty_level] || "text-muted-foreground"}`}>
                          <Mountain className="w-3.5 h-3.5" /> {pkg.difficulty_level}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-end justify-between pt-3 border-t border-border/30">
                      <div>
                        <span className="text-xl font-display font-semibold">{formatPrice(pkg.price_per_person)}</span>
                        <span className="text-xs text-muted-foreground font-body ml-1">/person</span>
                      </div>
                      <Button variant="hero" size="sm">Book Now</Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default SafariPackages;
