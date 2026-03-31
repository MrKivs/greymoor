import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useCurrency } from "@/contexts/CurrencyContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks: { label: string; href: string; isRoute?: boolean }[] = [
  { label: "Rooms", href: "#rooms" },
  { label: "Safaris", href: "#safaris" },
  { label: "Gallery", href: "/gallery", isRoute: true },
  { label: "About", href: "#about" },
];

const currencies = ["KES", "USD", "EUR", "GBP"] as const;

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { currency, setCurrency } = useCurrency();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-background/95 backdrop-blur-xl border-b border-border/40 py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex flex-col">
          <span className="font-display text-2xl font-semibold tracking-wide text-foreground leading-none">
            GREYMOOR
          </span>
          <span className="text-[10px] uppercase tracking-[0.35em] text-primary font-body mt-0.5">
            Safaris
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => link.isRoute ? navigate(link.href) : scrollTo(link.href)}
              className="text-sm font-body text-muted-foreground hover:text-primary transition-colors duration-300 tracking-wide"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Currency selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground font-body text-xs gap-1">
                {currency}
                <ChevronDown className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-card border-border">
              {currencies.map((c) => (
                <DropdownMenuItem
                  key={c}
                  onClick={() => setCurrency(c)}
                  className={`font-body text-sm ${currency === c ? "text-primary" : "text-foreground"}`}
                >
                  {c}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground font-body" onClick={() => navigate("/login")}>
            Login
          </Button>
          <Button variant="hero" size="sm" onClick={() => navigate("/book")}>
            Book Now
          </Button>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-foreground p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-background/98 backdrop-blur-xl border-t border-border/40 px-6 py-8 space-y-6">
          {navLinks.map((link) => (
            <button
              key={link.label}
              className="block text-lg font-display text-foreground hover:text-primary transition-colors"
              onClick={() => {
                setMobileOpen(false);
                link.isRoute ? navigate(link.href) : scrollTo(link.href);
              }}
            >
              {link.label}
            </button>
          ))}
          
          <div className="flex items-center gap-4 pt-4 border-t border-border/30">
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as typeof currency)}
              className="bg-transparent text-muted-foreground font-body text-sm border border-border/50 rounded-lg px-3 py-2"
            >
              {currencies.map((c) => (
                <option key={c} value={c} className="bg-background">{c}</option>
              ))}
            </select>
            <Button variant="ghost" size="sm" onClick={() => { setMobileOpen(false); navigate("/login"); }}>
              Login
            </Button>
          </div>
          
          <Button variant="hero" size="lg" className="w-full" onClick={() => { setMobileOpen(false); navigate("/book"); }}>
            Book Now
          </Button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
