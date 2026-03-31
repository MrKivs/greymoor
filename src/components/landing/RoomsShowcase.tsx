import { Users, Wifi, Bath, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCurrency } from "@/contexts/CurrencyContext";

interface Room {
  id: string;
  room_number: string;
  room_type: string;
  price_per_night: number;
  capacity: number;
  description: string | null;
  amenities: unknown;
  images: unknown;
}

const amenityIcons: Record<string, typeof Wifi> = {
  "Wi-Fi": Wifi,
  "WiFi": Wifi,
  "Bath": Bath,
  "Bathtub": Bath,
  "View": Eye,
  "Bush View": Eye,
};

const RoomsShowcase = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      const { data } = await supabase
        .from("rooms")
        .select("id, room_number, room_type, price_per_night, capacity, description, amenities, images")
        .eq("status", "available")
        .order("price_per_night", { ascending: true })
        .limit(4);
      if (data) setRooms(data);
      setLoading(false);
    };
    fetchRooms();
  }, []);

  const getImage = (images: unknown): string => {
    if (Array.isArray(images) && images.length > 0) {
      return typeof images[0] === "string" ? images[0] : "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=85";
    }
    return "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=85";
  };

  const getAmenities = (amenities: unknown): string[] => {
    if (Array.isArray(amenities)) return amenities.slice(0, 3).map(a => String(a));
    return ["Wi-Fi", "Minibar"];
  };

  const formatType = (type: string): string => {
    return type.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  return (
    <section id="rooms" className="section-padding grain-overlay relative" ref={ref}>
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="text-sm uppercase tracking-[0.3em] text-primary font-body mb-4"
          >
            Accommodations
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-light mb-6"
          >
            Rest in Refined Comfort
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground max-w-2xl mx-auto font-body leading-relaxed"
          >
            From intimate tented camps to expansive private villas, each space is designed to
            harmonize luxury with the untamed landscape.
          </motion.p>
        </div>

        {loading ? (
          <div className="flex gap-6 overflow-x-auto pb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="min-w-[320px] h-80 glass-card animate-pulse bg-muted/20" />
            ))}
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide -mx-6 px-6">
            {rooms.map((room, i) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.15 }}
                className="glass-card-hover min-w-[320px] sm:min-w-[380px] snap-center flex-shrink-0 overflow-hidden group"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={getImage(room.images)}
                    alt={room.room_type}
                    className="w-full h-full object-cover img-zoom"
                    loading="lazy"
                  />
                  <div className="absolute top-4 left-4 z-10">
                    <span className="glass-card px-3 py-1.5 text-xs font-body font-medium text-foreground">
                      {formatType(room.room_type)}
                    </span>
                  </div>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-muted-foreground text-sm font-body leading-relaxed line-clamp-2">
                    {room.description || "Experience luxury in the heart of the African wilderness."}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground font-body">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {room.capacity} Guests
                    </span>
                    {getAmenities(room.amenities).slice(0, 2).map((a) => {
                      const Icon = amenityIcons[a] || Wifi;
                      return (
                        <span key={a} className="flex items-center gap-1">
                          <Icon className="w-3.5 h-3.5" />
                          {a}
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex items-end justify-between pt-2 border-t border-border/30">
                    <div>
                      <span className="text-2xl font-display font-semibold text-foreground">{formatPrice(room.price_per_night)}</span>
                      <span className="text-xs text-muted-foreground font-body ml-1">/ night</span>
                    </div>
                    <Button variant="hero" size="sm" onClick={() => navigate("/book")}>
                      Book Now
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RoomsShowcase;
