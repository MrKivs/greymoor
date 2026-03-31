import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface TextRevealProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  delay?: number;
  byWord?: boolean;
}

const TextReveal = ({
  children,
  className = "",
  as: Tag = "h2",
  delay = 0,
  byWord = true,
}: TextRevealProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const units = byWord ? children.split(" ") : children.split("");

  return (
    <Tag ref={ref} className={`${className} overflow-hidden`}>
      {units.map((unit, i) => (
        <span key={i} className="inline-block overflow-hidden">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={isInView ? { y: "0%" } : { y: "110%" }}
            transition={{
              duration: 0.5,
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: delay + i * (byWord ? 0.08 : 0.03),
            }}
          >
            {unit}
            {byWord && i < units.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
};

export default TextReveal;
