// Static grain overlay — no animation to keep it zero-CPU
const GrainOverlay = () => (
  <div
    className="fixed inset-0 z-[9990] pointer-events-none"
    style={{
      opacity: 0.04,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
      backgroundRepeat: "repeat",
      backgroundSize: "256px 256px",
    }}
  />
);

export default GrainOverlay;
