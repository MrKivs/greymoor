import { Shield, Leaf, Award, Heart } from "lucide-react";
import TextReveal from "@/components/animations/TextReveal";
import ImageReveal from "@/components/animations/ImageReveal";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const values = [
  {
    icon: Shield,
    title: "Trusted Since 2012",
    description: "Over a decade of unforgettable African safari experiences.",
  },
  {
    icon: Leaf,
    title: "Eco-Conscious",
    description: "Committed to conservation and sustainable tourism practices.",
  },
  {
    icon: Award,
    title: "Award-Winning",
    description: "Recognized by Travel + Leisure and Condé Nast Traveler.",
  },
  {
    icon: Heart,
    title: "Community First",
    description: "Supporting local Maasai communities and wildlife sanctuaries.",
  },
];

const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-24 px-6 grain-overlay relative" ref={ref}>
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <div className="relative">
            <ImageReveal className="glass-card overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=900&q=85"
                alt="Greymoor Safaris lodge at sunset"
                className="w-full h-[400px] lg:h-[520px] object-cover"
                loading="lazy"
              />
            </ImageReveal>
            {/* Floating stats card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="absolute -bottom-6 -right-4 sm:right-6 glass-card p-6 space-y-1"
            >
              <p className="text-3xl font-display font-bold text-gradient-gold">12+</p>
              <p className="text-xs text-muted-foreground font-body uppercase tracking-wider">
                Years of Excellence
              </p>
            </motion.div>
          </div>

          {/* Content */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.2 }}
              className="text-sm uppercase tracking-[0.3em] text-primary font-body mb-4"
            >
              Our Story
            </motion.p>
            <TextReveal
              as="h2"
              className="font-display text-4xl sm:text-5xl font-light mb-8 leading-tight"
              delay={0.3}
            >
              Born from a Love for Wild Places
            </TextReveal>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
              className="text-muted-foreground font-body leading-relaxed mb-6"
            >
              Greymoor Safaris was founded on a simple belief: that the most transformative
              travel experiences happen where untamed wilderness meets thoughtful luxury.
              Nestled in the heart of East Africa's most spectacular landscapes, our lodges
              and camps offer a sanctuary for the soul.
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 }}
              className="text-muted-foreground font-body leading-relaxed mb-10"
            >
              Every detail — from the hand-selected furnishings to the expert-guided game drives —
              is crafted to immerse you in the rhythm of the African bush while keeping you
              wrapped in comfort.
            </motion.p>

            <div className="grid grid-cols-2 gap-6">
              {values.map((v, i) => (
                <motion.div
                  key={v.title}
                  className="flex gap-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.9 + i * 0.1 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <v.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-body font-semibold text-foreground mb-1">{v.title}</p>
                    <p className="text-xs text-muted-foreground font-body leading-relaxed">{v.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
