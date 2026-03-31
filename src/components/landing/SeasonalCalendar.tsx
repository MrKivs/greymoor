import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Sun, Cloud, CloudRain, Sparkles } from "lucide-react";

const months = [
  { name: "Jan", weather: "dry", event: "Calving Season", crowd: "high", highlight: false },
  { name: "Feb", weather: "dry", event: "Calving Continues", crowd: "high", highlight: false },
  { name: "Mar", weather: "rain", event: "Long Rains Begin", crowd: "low", highlight: false },
  { name: "Apr", weather: "rain", event: "Green Season", crowd: "low", highlight: false },
  { name: "May", weather: "rain", event: "Bird Migration", crowd: "low", highlight: false },
  { name: "Jun", weather: "dry", event: "Dry Season Starts", crowd: "medium", highlight: false },
  { name: "Jul", weather: "dry", event: "Great Migration", crowd: "high", highlight: true },
  { name: "Aug", weather: "dry", event: "River Crossings", crowd: "high", highlight: true },
  { name: "Sep", weather: "dry", event: "Peak Migration", crowd: "high", highlight: true },
  { name: "Oct", weather: "dry", event: "Migration South", crowd: "high", highlight: true },
  { name: "Nov", weather: "rain", event: "Short Rains", crowd: "medium", highlight: false },
  { name: "Dec", weather: "rain", event: "Festive Season", crowd: "medium", highlight: false },
];

const weatherIcons: Record<string, typeof Sun> = {
  dry: Sun,
  rain: CloudRain,
  mixed: Cloud,
};

const crowdColors: Record<string, string> = {
  low: "bg-secondary/60",
  medium: "bg-accent/60",
  high: "bg-primary/80",
};

const SeasonalCalendar = () => {
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
            Plan Your Journey
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-light mb-6"
          >
            When to Visit
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground max-w-2xl mx-auto font-body leading-relaxed"
          >
            Each season offers unique experiences. July to October is prime time for the 
            Great Migration — nature's most spectacular show.
          </motion.p>
        </div>

        {/* Horizontal scroll calendar */}
        <div className="flex gap-3 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide -mx-6 px-6">
          {months.map((month, i) => {
            const WeatherIcon = weatherIcons[month.weather];
            return (
              <motion.div
                key={month.name}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.05 }}
                className={`min-w-[100px] snap-center flex-shrink-0 glass-card p-4 text-center relative ${
                  month.highlight ? "border-primary/50 shadow-[0_0_20px_hsl(var(--amber)/0.2)]" : ""
                }`}
              >
                {month.highlight && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                )}

                <p className="font-display text-lg font-semibold mb-2">{month.name}</p>
                
                <WeatherIcon className={`w-5 h-5 mx-auto mb-2 ${month.weather === "dry" ? "text-amber" : "text-muted-foreground"}`} />
                
                <p className="text-[10px] text-muted-foreground font-body mb-3 line-clamp-2 h-8">
                  {month.event}
                </p>

                {/* Crowd level bar */}
                <div className="flex justify-center gap-1">
                  <div className={`h-1.5 w-full rounded-full ${crowdColors[month.crowd]}`} />
                </div>
                <p className="text-[9px] text-faint font-body mt-1 uppercase tracking-wider">
                  {month.crowd}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-6 mt-8"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary/80" />
            <span className="text-xs text-muted-foreground font-body">High Season</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent/60" />
            <span className="text-xs text-muted-foreground font-body">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-secondary/60" />
            <span className="text-xs text-muted-foreground font-body">Low Season</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-xs text-muted-foreground font-body">Great Migration</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SeasonalCalendar;
