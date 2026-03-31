import { MapPin, Phone, Mail, Instagram, Facebook, Twitter, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 py-16 px-6 grain-overlay relative bg-[hsl(var(--background))]">
      <div className="container mx-auto relative z-10">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="mb-4">
              <span className="font-display text-2xl font-semibold tracking-wide">GREYMOOR</span>
              <span className="block text-[10px] uppercase tracking-[0.35em] text-primary font-body mt-0.5">
                Safaris
              </span>
            </div>
            <p className="text-sm text-muted-foreground font-body leading-relaxed mb-6">
              Where the wild meets luxury. East Africa's premier safari lodge destination since 2012.
            </p>
            <div className="flex gap-3">
              {[Instagram, Facebook, Twitter, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-body mb-4">
              Explore
            </p>
            <ul className="space-y-3">
              {["Rooms & Suites", "Safari Packages", "Virtual Tours", "Gallery", "Blog"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary font-body transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Safari Destinations */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-body mb-4">
              Destinations
            </p>
            <ul className="space-y-3">
              {["Masai Mara", "Amboseli", "Samburu", "Tsavo", "Lake Nakuru", "Laikipia"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary font-body transition-colors">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-body mb-4">
              Contact Us
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-muted-foreground font-body">
                <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                Masai Mara National Reserve, Narok County, Kenya
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                <Phone className="w-4 h-4 text-primary flex-shrink-0" />
                +254 700 123 456
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                <Mail className="w-4 h-4 text-primary flex-shrink-0" />
                reservations@greymoorsafaris.com
              </li>
            </ul>
          </div>
        </div>

        {/* Acacia tree silhouette decoration */}
        <div className="absolute bottom-0 right-0 w-64 h-32 opacity-5 pointer-events-none">
          <svg viewBox="0 0 200 100" fill="currentColor" className="w-full h-full text-foreground">
            <path d="M100 100 L100 60 M100 60 C80 60 60 40 50 20 M100 60 C120 60 140 40 150 20 M100 50 C70 50 40 30 30 10 M100 50 C130 50 160 30 170 10 M80 45 C60 35 40 15 25 5 M120 45 C140 35 160 15 175 5" 
              stroke="currentColor" 
              strokeWidth="2" 
              fill="none"
            />
          </svg>
        </div>

        <div className="border-t border-border/30 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground font-body">
            © {new Date().getFullYear()} Greymoor Safaris. All rights reserved.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-muted-foreground hover:text-primary font-body transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-muted-foreground hover:text-primary font-body transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
