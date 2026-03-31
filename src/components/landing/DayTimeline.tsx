import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Sunrise, Coffee, Waves, Binoculars, Wine, Flame } from "lucide-react";

const timelineItems = [
  {
    time: "05:30 AM",
    title: "Morning Game Drive",
    description: "Set out at dawn when predators are most active. Witness the savanna come alive.",
    icon: Sunrise,
    image: "https://images.unsplash.com/photo-1504432842672-1a79f78e4084?w=600&q=85",
    isVideo: false,
  },
  {
    time: "08:00 AM",
    title: "Bush Breakfast",
    description: "A chef-prepared breakfast under acacia trees. Fresh juice, eggs to order, and panoramic views.",
    icon: Coffee,
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=85",
    isVideo: false,
  },
  {
    time: "11:00 AM",
    title: "Pool & Leisure",
    description: "Relax by the infinity pool overlooking the waterhole. Watch wildlife as you unwind.",
    icon: Waves,
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=85",
    isVideo: false,
  },
  {
    time: "03:00 PM",
    title: "Afternoon Safari",
    description: "As the heat subsides, animals gather at watering holes. Prime time for elephant herds.",
    icon: Binoculars,
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=85",
    isVideo: false,
  },
  {
    time: "06:00 PM",
    title: "Sundowner Drinks",
    description: "Champagne and canapés as the sun sets over the Mara. An unforgettable golden hour.",
    icon: Wine,
    image: "https://images.unsplash.com/photo-1474511320723-9a56873571b7?w=600&q=85",
    isVideo: false,
  },
  {
    time: "08:00 PM",
    title: "Boma Dinner",
    description: "Dine under the stars around a crackling fire. Maasai stories and five-course cuisine.",
    icon: Flame,
    image: "https://images.unsplash.com/photo-1475483768296-6163e08872a1?w=600&q=85",
    isVideo: false,
  },
];

const DayTimeline = () => {
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
            A Day at Greymoor
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-light mb-6"
          >
            Dawn to Dusk
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground max-w-2xl mx-auto font-body leading-relaxed"
          >
            Every day is an adventure, from the first light of dawn to the last ember of the campfire.
          </motion.p>
        </div>

        {/* Horizontal scroll on mobile, grid on desktop */}
        <div className="flex lg:grid lg:grid-cols-3 gap-6 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide -mx-6 px-6 lg:mx-0 lg:px-0">
          {timelineItems.map((item, i) => (
            <motion.div
              key={item.time}
              initial={{ opacity: 0, x: 40 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
              className="min-w-[300px] lg:min-w-0 snap-center flex-shrink-0 glass-card-hover overflow-hidden group"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover img-zoom"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                
                {/* Time badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="glass-card px-3 py-1.5 text-sm font-display font-semibold text-primary">
                    {item.time}
                  </span>
                </div>

                {/* Icon */}
                <div className="absolute bottom-3 right-3 z-10 w-10 h-10 rounded-lg bg-primary/20 backdrop-blur-sm flex items-center justify-center border border-primary/30">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-display text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground font-body leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DayTimeline;
