import { Star, Quote } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  comment: string | null;
  overall_rating: number | null;
  reviewer_name: string | null;
  reviewer_nationality: string | null;
  stay_type: string | null;
}

const fallbackReviews = [
  {
    id: "1",
    reviewer_name: "Sarah & James W.",
    reviewer_nationality: "London, UK",
    comment: "Greymoor exceeded every expectation. Watching the sunrise over the Mara from our private deck, coffee in hand, was the single most magical moment of our lives.",
    overall_rating: 5,
    stay_type: "Honeymoon",
  },
  {
    id: "2",
    reviewer_name: "David Kimani",
    reviewer_nationality: "Nairobi, Kenya",
    comment: "As a Kenyan, I've visited many lodges. Greymoor is in a league of its own — the attention to detail, the warmth of the staff, and the sheer beauty of the location.",
    overall_rating: 5,
    stay_type: "Family",
  },
  {
    id: "3",
    reviewer_name: "Akiko Tanaka",
    reviewer_nationality: "Tokyo, Japan",
    comment: "The elephant walking past our tent at dawn, the Maasai warrior stories by the fire — this wasn't a holiday, it was a transformation. Already planning our return.",
    overall_rating: 5,
    stay_type: "Solo",
  },
  {
    id: "4",
    reviewer_name: "Marcus & Elke B.",
    reviewer_nationality: "Berlin, Germany",
    comment: "We've been to the Serengeti, Kruger, and Okavango. Greymoor Safaris is the gold standard. Absolute perfection from start to finish.",
    overall_rating: 5,
    stay_type: "Anniversary",
  },
];

const Testimonials = () => {
  const [active, setActive] = useState(0);
  const [reviews, setReviews] = useState<Review[]>(fallbackReviews);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("id, comment, overall_rating, reviewer_name, reviewer_nationality, stay_type")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(6);
      if (data && data.length > 0) {
        setReviews(data);
      }
    };
    fetchReviews();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  const t = reviews[active];

  return (
    <section id="testimonials" className="section-padding grain-overlay relative" ref={ref}>
      <div className="container mx-auto max-w-4xl text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          className="text-sm uppercase tracking-[0.3em] text-primary font-body mb-4"
        >
          Guest Voices
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="font-display text-4xl sm:text-5xl font-light mb-16"
        >
          Stories from the Bush
        </motion.h2>

        <div className="glass-card p-8 sm:p-12 relative">
          <Quote className="w-10 h-10 text-primary/20 absolute top-6 left-6" />

          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              {/* Avatar placeholder */}
              <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/30 mb-6 flex items-center justify-center">
                <span className="font-display text-xl text-primary">
                  {t.reviewer_name?.charAt(0) || "G"}
                </span>
              </div>

              <p className="font-display text-xl sm:text-2xl italic leading-relaxed mb-6 max-w-2xl text-foreground/90">
                "{t.comment}"
              </p>

              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.overall_rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>

              <p className="font-body font-semibold text-foreground text-sm">{t.reviewer_name}</p>
              <p className="font-body text-xs text-muted-foreground">{t.reviewer_nationality}</p>
              {t.stay_type && (
                <span className="mt-2 text-[10px] px-2 py-0.5 rounded-full border border-primary/30 text-primary font-body">
                  {t.stay_type}
                </span>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {reviews.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === active ? "bg-primary w-6" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
