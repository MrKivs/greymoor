import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

interface NumberMorphProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
}

const NumberMorph = ({
  value,
  prefix = "",
  suffix = "",
  className = "",
  duration = 2,
}: NumberMorphProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);
  const [blurAmount, setBlurAmount] = useState(8);

  useEffect(() => {
    if (!isInView) return;

    const startTime = performance.now();
    const animate = (time: number) => {
      const elapsed = (time - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      setBlurAmount(8 * (1 - eased));

      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, value, duration]);

  return (
    <motion.span
      ref={ref}
      className={className}
      style={{ filter: `blur(${blurAmount}px)` }}
    >
      {prefix}{display.toLocaleString()}{suffix}
    </motion.span>
  );
};

export default NumberMorph;
