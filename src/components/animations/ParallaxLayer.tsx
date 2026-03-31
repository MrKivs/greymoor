import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

interface ParallaxLayerProps {
  src: string;
  alt: string;
  speed: number; // 0 = no movement, 1 = full scroll speed
  className?: string;
}

const ParallaxLayer = ({ src, alt, speed, className = "" }: ParallaxLayerProps) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", `${speed * 40}%`]);

  return (
    <motion.div
      ref={ref}
      className={`absolute inset-0 overflow-hidden ${className}`}
      style={{ y }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-[120%] object-cover"
      />
    </motion.div>
  );
};

export default ParallaxLayer;
