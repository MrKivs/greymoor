import { useRef, ReactNode } from "react";
import { motion, useInView } from "framer-motion";

interface ImageRevealProps {
  children: ReactNode;
  className?: string;
  direction?: "left" | "right";
}

const ImageReveal = ({ children, className = "", direction = "left" }: ImageRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {children}
      <motion.div
        className="absolute inset-0 bg-background z-10"
        initial={{ x: "0%" }}
        animate={isInView ? { x: direction === "left" ? "101%" : "-101%" } : { x: "0%" }}
        transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
      />
    </div>
  );
};

export default ImageReveal;
