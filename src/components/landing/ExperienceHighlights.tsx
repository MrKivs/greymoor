import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Binoculars, Sunset, UtensilsCrossed, Flame, Compass, Camera } from "lucide-react";

const experiences = [
  {
    icon: Binoculars,
    title: "Game Drives",
    description: "Expert-guided dawn and dusk drives through pristine wilderness. Open-top Land Cruisers, cold drinks, and front-row seats to nature's greatest show.",
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=85",
  },
  {
    icon: Sunset,
    title: "Balloon Safaris",
    description: "Float silently over the Mara at sunrise. Champagne breakfast on the savanna after landing. An experience you'll never forget.",
    image: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=600&q=85",
  },
  {
    icon: UtensilsCrossed,
    title: "Bush Dining",
    description: "Candlelit dinners under a canopy of stars. Our chefs prepare five-course feasts using locally sourced ingredients, paired with fine wines.",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=85",
  },
  {
    icon: Flame,
    title: "Campfire Stories",
    description: "Gather around the fire as Maasai warriors share centuries-old tales. The sounds of the bush become your soundtrack.",
    image: "https://images.unsplash.com/photo-1475483768296-6163e08872a1?w=600&q=85",
  },
  {
    icon: Compass,
    title: "Walking Safaris",
    description: "Guided bush walks with armed rangers. Track animals on foot, learn to read the landscape, and connect with nature intimately.",
    image: "https://images.unsplash.com/photo-1504432842672-1a79f78e4084?w=600&q=85",
  },
  {
    icon: Camera,
    title: "Photography Hides",
    description: "Purpose-built hides at watering holes for photographers. Capture wildlife at eye level — no vehicle, no barrier, just you and the wild.",
    image: "https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=600&q=85",
  },
];

const ExperienceHighlights = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-24 px-6 grain-overlay relative" ref={ref}>
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="text-sm uppercase tracking-[0.3em] text-primary font-body mb-4"
          >
            Signature Experiences
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-light mb-6"
          >
            Beyond the Ordinary
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground max-w-2xl mx-auto font-body leading-relaxed"
          >
            Every moment at Greymoor is crafted to create memories that transcend the typical safari.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {experiences.map((exp, i) => (
            <motion.div
              key={exp.title}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              className="glass-card-hover overflow-hidden group relative"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={exp.image}
                  alt={exp.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                <div className="absolute bottom-4 left-4 w-12 h-12 rounded-xl bg-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/30">
                  <exp.icon className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="font-display text-xl font-semibold mb-2">{exp.title}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">{exp.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceHighlights;
