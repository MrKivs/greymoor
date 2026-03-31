import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import NumberMorph from "@/components/animations/NumberMorph";

const bigFive = [
  {
    name: "Lion",
    image: "https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?w=600&q=85",
    sightings: 847,
    rarity: "Common",
    fact: "The only social cats, lions live in prides of up to 30 members.",
  },
  {
    name: "Leopard",
    image: "https://images.unsplash.com/photo-1585974738771-84483dd9f89f?w=600&q=85",
    sightings: 234,
    rarity: "Rare",
    fact: "Masters of stealth, leopards can carry prey twice their weight up a tree.",
  },
  {
    name: "Elephant",
    image: "https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=600&q=85",
    sightings: 1203,
    rarity: "Common",
    fact: "Elephants can recognize themselves in mirrors — a sign of self-awareness.",
  },
  {
    name: "Buffalo",
    image: "https://images.unsplash.com/photo-1504471890350-85dea3399dc5?w=600&q=85",
    sightings: 956,
    rarity: "Common",
    fact: "Buffalos have excellent memory and can recognize individual humans.",
  },
  {
    name: "Rhino",
    image: "https://images.unsplash.com/photo-1574068468669-d5c014e1a7c1?w=600&q=85",
    sightings: 89,
    rarity: "Rare",
    fact: "Despite weighing 2 tons, rhinos can run at speeds up to 40 mph.",
  },
];

const rarityStyles: Record<string, string> = {
  Common: "bg-secondary/20 text-secondary-foreground border-secondary/30",
  Rare: "bg-primary/20 text-primary border-primary/30 animate-pulse-amber",
};

const BigFiveTracker = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="section-padding grain-overlay relative overflow-hidden" ref={ref}>
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="text-sm uppercase tracking-[0.3em] text-primary font-body mb-4"
          >
            Track the Legends
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-light mb-6"
          >
            The Big Five
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground max-w-2xl mx-auto font-body leading-relaxed"
          >
            Real-time sighting data from our expert guides. Track the most sought-after 
            wildlife encounters in Africa.
          </motion.p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {bigFive.map((animal, i) => (
            <motion.div
              key={animal.name}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              className="glass-card-hover overflow-hidden group"
            >
              <div className="relative h-48 md:h-56 overflow-hidden">
                <img
                  src={animal.image}
                  alt={animal.name}
                  className="w-full h-full object-cover img-zoom"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                
                {/* Rarity badge */}
                <div className="absolute top-3 right-3 z-10">
                  <span className={`px-2 py-1 text-[10px] font-body font-medium rounded-full border ${rarityStyles[animal.rarity]}`}>
                    {animal.rarity}
                  </span>
                </div>

                {/* Name and sightings */}
                <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
                  <h3 className="font-display text-xl font-semibold mb-1">{animal.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-display font-bold text-gradient-gold">
                      <NumberMorph value={isInView ? animal.sightings : 0} className="inline" />
                    </span>
                    <span className="text-xs text-muted-foreground font-body">sightings</span>
                  </div>
                </div>
              </div>

              {/* Fun fact on hover */}
              <div className="p-4 bg-surface/50">
                <p className="text-xs text-muted-foreground font-body leading-relaxed line-clamp-2">
                  {animal.fact}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9 }}
          className="text-center text-xs text-faint font-body mt-8"
        >
          Data updated weekly from Greymoor guide reports · This season
        </motion.p>
      </div>
    </section>
  );
};

export default BigFiveTracker;
