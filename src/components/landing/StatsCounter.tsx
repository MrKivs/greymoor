import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import NumberMorph from "@/components/animations/NumberMorph";

const stats = [
  { value: 15000, suffix: "+", label: "Guests Hosted" },
  { value: 12, suffix: "", label: "Years of Excellence" },
  { value: 98, suffix: "%", label: "Guest Satisfaction" },
  { value: 250, suffix: "+", label: "Wildlife Species" },
  { value: 50000, suffix: "+", label: "Acres of Wilderness" },
  { value: 4.9, suffix: "/5", label: "Average Rating", decimals: 1 },
];

const StatsCounter = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-20 px-6 relative overflow-hidden" ref={ref}>
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=1920&q=75"
          alt="Savanna backdrop"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/85 backdrop-blur-sm" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="text-center"
            >
              <div className="text-3xl sm:text-4xl font-display font-bold text-gradient-gold">
                <NumberMorph value={isInView ? stat.value : 0} className="inline" />
                {stat.suffix}
              </div>
              <p className="text-xs text-muted-foreground font-body mt-2 uppercase tracking-wider">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsCounter;
