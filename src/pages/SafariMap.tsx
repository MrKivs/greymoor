import { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, X, MapPin, Clock, Users, DollarSign, Route, Trash2, Send, CheckCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";

// Safari destination data with coordinates
const destinations = [
  {
    id: "masai-mara",
    name: "Masai Mara",
    lat: -1.4061,
    lng: 35.2835,
    image: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600&q=85",
    wildlife: ["Lions", "Wildebeest", "Elephants", "Leopards", "Cheetahs"],
    bestSeason: "Jul – Oct (Great Migration)",
    description: "Kenya's most famous wildlife reserve, home to the Great Migration.",
  },
  {
    id: "amboseli",
    name: "Amboseli",
    lat: -2.6527,
    lng: 37.2606,
    image: "https://images.unsplash.com/photo-1535338454528-1b5c57e4fa28?w=600&q=85",
    wildlife: ["Elephants", "Flamingos", "Hippos", "Giraffes"],
    bestSeason: "Jun – Oct (Dry Season)",
    description: "Famous for large elephant herds with Kilimanjaro as the backdrop.",
  },
  {
    id: "samburu",
    name: "Samburu",
    lat: 0.5653,
    lng: 37.5345,
    image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600&q=85",
    wildlife: ["Grevy's Zebra", "Reticulated Giraffe", "Gerenuk", "Somali Ostrich"],
    bestSeason: "Jun – Sep & Jan – Feb",
    description: "Remote wilderness with rare endemic species found nowhere else.",
  },
  {
    id: "tsavo",
    name: "Tsavo East & West",
    lat: -2.9833,
    lng: 38.4667,
    image: "https://images.unsplash.com/photo-1549366021-9f761d450615?w=600&q=85",
    wildlife: ["Red Elephants", "Lions", "Rhinos", "Buffalos"],
    bestSeason: "Jun – Oct",
    description: "Kenya's largest national park with dramatic red earth landscapes.",
  },
  {
    id: "nakuru",
    name: "Lake Nakuru",
    lat: -0.3667,
    lng: 36.0833,
    image: "https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=600&q=85",
    wildlife: ["Flamingos", "Rhinos", "Pelicans", "Baboons"],
    bestSeason: "Year-round",
    description: "Soda lake famous for million-strong flamingo flocks and rhino sanctuary.",
  },
  {
    id: "mt-kenya",
    name: "Mount Kenya",
    lat: -0.1521,
    lng: 37.3084,
    image: "https://images.unsplash.com/photo-1489392191049-fc10c97e64b6?w=600&q=85",
    wildlife: ["Mountain Bongo", "Colobus Monkey", "Sunbird", "Hyrax"],
    bestSeason: "Jan – Feb & Aug – Sep",
    description: "Africa's second-highest peak with glacial valleys and alpine moorlands.",
  },
  {
    id: "laikipia",
    name: "Laikipia Plateau",
    lat: 0.3,
    lng: 36.9,
    image: "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600&q=85",
    wildlife: ["Wild Dogs", "Black Rhinos", "Elephants", "Zebras"],
    bestSeason: "Jun – Oct & Dec – Mar",
    description: "Private conservancies offering exclusive, crowd-free wildlife experiences.",
  },
];

const quoteSchema = z.object({
  full_name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().email("Invalid email").max(255),
  phone: z.string().trim().max(20).optional().or(z.literal("")),
  guests_count: z.number().min(1).max(50),
  preferred_dates: z.string().trim().max(200).optional().or(z.literal("")),
  special_requests: z.string().trim().max(1000).optional().or(z.literal("")),
});

// Custom pulsing marker icon
const createPulsingIcon = (isSelected: boolean) => {
  return L.divIcon({
    className: "custom-pulsing-marker",
    html: `
      <div class="marker-container ${isSelected ? "selected" : ""}">
        <div class="marker-ring"></div>
        <div class="marker-dot"></div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const createNumberIcon = (num: number) => {
  return L.divIcon({
    className: "custom-number-marker",
    html: `<div class="number-marker"><span>${num}</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const FitBounds = ({ bounds }: { bounds: L.LatLngBoundsExpression | null }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds) map.fitBounds(bounds, { padding: [60, 60], maxZoom: 8 });
  }, [bounds, map]);
  return null;
};

const SafariMap = () => {
  const [selectedDest, setSelectedDest] = useState<typeof destinations[0] | null>(null);
  const [routeStops, setRouteStops] = useState<typeof destinations>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [routeMode, setRouteMode] = useState(false);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    guests_count: 2,
    preferred_dates: "",
    special_requests: "",
  });

  useEffect(() => {
    supabase.from("safari_packages").select("*").eq("status", "active").then(({ data }) => {
      if (data) setPackages(data);
    });
  }, []);

  const getPackagesForDest = (destName: string) => {
    return packages.filter((p) => {
      const dests = p.destinations as string[];
      return dests?.some((d: string) => d.toLowerCase().includes(destName.toLowerCase()));
    });
  };

  const addToRoute = (dest: typeof destinations[0]) => {
    if (!routeStops.find((s) => s.id === dest.id)) {
      setRouteStops([...routeStops, dest]);
    }
  };

  const removeFromRoute = (destId: string) => {
    setRouteStops(routeStops.filter((s) => s.id !== destId));
  };

  const routeCoords: [number, number][] = routeStops.map((s) => [s.lat, s.lng]);
  const estimatedDays = routeStops.length * 3;
  const estimatedPrice = routeStops.length * 1800;

  const openQuoteForm = () => {
    setShowQuoteForm(true);
    setQuoteSubmitted(false);
    setErrors({});
  };

  const handleSubmitQuote = async () => {
    const result = quoteSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const { error } = await supabase.from("quote_requests" as any).insert({
        full_name: result.data.full_name,
        email: result.data.email,
        phone: result.data.phone || null,
        guests_count: result.data.guests_count,
        preferred_dates: result.data.preferred_dates || null,
        special_requests: result.data.special_requests || null,
        destinations: routeStops.map((s) => s.name),
        estimated_days: estimatedDays,
        estimated_price: estimatedPrice,
      } as any);

      if (error) throw error;
      setQuoteSubmitted(true);
      toast.success("Quote request submitted! We'll be in touch soon.");
    } catch (err: any) {
      toast.error("Failed to submit quote. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="h-screen w-full relative bg-background overflow-hidden">
      {/* Safari map styles */}
      <style>{`
        .custom-pulsing-marker .marker-container {
          position: relative; width: 40px; height: 40px;
          display: flex; align-items: center; justify-content: center;
        }
        .custom-pulsing-marker .marker-ring {
          position: absolute; width: 36px; height: 36px; border-radius: 50%;
          border: 2px solid hsl(34 55% 51%);
          animation: pulse-ring 2s ease-out infinite;
        }
        .custom-pulsing-marker .marker-dot {
          width: 12px; height: 12px; border-radius: 50%;
          background: hsl(34 55% 51%);
          box-shadow: 0 0 12px hsl(34 55% 51% / 0.6); z-index: 1;
        }
        .custom-pulsing-marker .marker-container.selected .marker-ring {
          border-color: hsl(40 55% 58%); width: 44px; height: 44px;
        }
        .custom-pulsing-marker .marker-container.selected .marker-dot {
          width: 16px; height: 16px; background: hsl(40 55% 58%);
        }
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .custom-number-marker .number-marker {
          width: 32px; height: 32px; border-radius: 50%;
          background: hsl(34 55% 51%); color: hsl(60 5% 10%);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px; font-family: 'Inter', sans-serif;
          box-shadow: 0 2px 10px hsl(34 55% 51% / 0.5);
        }
        .leaflet-container { background: hsl(60 5% 10%) !important; }
        .leaflet-control-zoom { border: none !important; }
        .leaflet-control-zoom a {
          background: hsl(60 4% 13% / 0.9) !important;
          color: hsl(36 38% 93%) !important;
          border: 1px solid hsl(60 5% 20%) !important;
          backdrop-filter: blur(12px);
        }
        .leaflet-control-zoom a:hover { background: hsl(60 4% 18%) !important; }
        .leaflet-control-attribution {
          background: hsl(60 4% 13% / 0.8) !important;
          color: hsl(36 15% 60%) !important; font-size: 10px;
        }
        .leaflet-control-attribution a { color: hsl(34 55% 51%) !important; }
      `}</style>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-background/80 backdrop-blur-xl border-b border-border/30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </Link>
          <h1 className="font-display text-lg font-semibold">
            Safari <span className="text-gradient-gold">Explorer</span>
          </h1>
        </div>
        <Button
          variant={routeMode ? "hero" : "hero-outline"}
          size="sm"
          onClick={() => setRouteMode(!routeMode)}
        >
          <Route className="w-4 h-4 mr-1" />
          {routeMode ? "Planning Route" : "Plan My Safari"}
        </Button>
      </div>

      {/* Map */}
      <MapContainer
        center={[-0.5, 37.0]}
        zoom={6}
        className="h-full w-full"
        zoomControl={true}
        attributionControl={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />

        {destinations.map((dest) => (
          <Marker
            key={dest.id}
            position={[dest.lat, dest.lng]}
            icon={
              routeMode && routeStops.find((s) => s.id === dest.id)
                ? createNumberIcon(routeStops.findIndex((s) => s.id === dest.id) + 1)
                : createPulsingIcon(selectedDest?.id === dest.id)
            }
            eventHandlers={{
              click: () => {
                if (routeMode) {
                  if (routeStops.find((s) => s.id === dest.id)) {
                    removeFromRoute(dest.id);
                  } else {
                    addToRoute(dest);
                  }
                } else {
                  setSelectedDest(dest);
                }
              },
            }}
          />
        ))}

        {routeMode && routeCoords.length > 1 && (
          <Polyline
            positions={routeCoords}
            pathOptions={{
              color: "hsl(34, 55%, 51%)",
              weight: 2,
              dashArray: "8, 12",
              opacity: 0.7,
            }}
          />
        )}
      </MapContainer>

      {/* Info card */}
      {selectedDest && !routeMode && (
        <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-auto sm:w-[400px] z-[1000] glass-card overflow-hidden animate-fade-up">
          <div className="relative h-44 overflow-hidden">
            <img src={selectedDest.image} alt={selectedDest.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
            <button
              onClick={() => setSelectedDest(null)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-background/60 backdrop-blur flex items-center justify-center text-foreground hover:bg-background/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-4 left-4">
              <h3 className="font-display text-2xl font-semibold">{selectedDest.name}</h3>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <p className="text-sm text-muted-foreground font-body leading-relaxed">{selectedDest.description}</p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Best Season: {selectedDest.bestSeason}</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-2">Wildlife Highlights</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedDest.wildlife.map((w) => (
                  <span key={w} className="text-[10px] px-2 py-0.5 rounded-full border border-border/50 text-muted-foreground font-body">{w}</span>
                ))}
              </div>
            </div>
            {getPackagesForDest(selectedDest.name).length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-2">Available Packages</p>
                {getPackagesForDest(selectedDest.name).map((pkg: any) => (
                  <div key={pkg.id} className="flex items-center justify-between py-2 border-t border-border/20">
                    <div>
                      <p className="text-sm font-body font-medium text-foreground">{pkg.name}</p>
                      <p className="text-xs text-muted-foreground font-body">{pkg.duration_days} days · Max {pkg.max_group_size} guests</p>
                    </div>
                    <span className="font-display font-semibold text-primary">${Number(pkg.price_per_person).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
            <Button variant="hero" className="w-full" onClick={() => { setRouteMode(true); addToRoute(selectedDest); setSelectedDest(null); }}>
              <Route className="w-4 h-4 mr-2" /> Add to Route
            </Button>
          </div>
        </div>
      )}

      {/* Route planner panel */}
      {routeMode && (
        <div className="absolute top-16 right-4 bottom-4 w-[340px] z-[1000] glass-card overflow-hidden hidden sm:flex flex-col">
          <div className="p-5 border-b border-border/30">
            <h3 className="font-display text-lg font-semibold mb-1">Plan My Safari</h3>
            <p className="text-xs text-muted-foreground font-body">Click destinations on the map to build your route</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {routeStops.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-body">Click pins on the map to add destinations</p>
              </div>
            ) : (
              routeStops.map((stop, i) => (
                <div key={stop.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body font-medium truncate">{stop.name}</p>
                    <p className="text-[10px] text-muted-foreground font-body">~3 days</p>
                  </div>
                  <button onClick={() => removeFromRoute(stop.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {routeStops.length > 0 && (
            <div className="p-5 border-t border-border/30 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wider font-body">Duration</span>
                  </div>
                  <p className="font-display text-lg font-semibold">{estimatedDays} Days</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span className="text-[10px] uppercase tracking-wider font-body">Est. Price</span>
                  </div>
                  <p className="font-display text-lg font-semibold text-gradient-gold">${estimatedPrice.toLocaleString()}</p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground font-body text-center">Per person · {routeStops.length} destinations</p>
              <Button variant="hero" className="w-full" onClick={openQuoteForm}>
                <Send className="w-4 h-4 mr-2" /> Request Custom Quote
              </Button>
              <button onClick={() => setRouteStops([])} className="w-full text-xs text-muted-foreground hover:text-foreground font-body transition-colors text-center">
                Clear Route
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mobile route summary */}
      {routeMode && routeStops.length > 0 && (
        <div className="absolute bottom-4 left-4 right-4 z-[1000] glass-card p-4 sm:hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-muted-foreground font-body">{routeStops.length} destinations · {estimatedDays} days</p>
              <p className="font-display text-lg font-semibold text-gradient-gold">${estimatedPrice.toLocaleString()}/person</p>
            </div>
            <Button variant="hero" size="sm" onClick={openQuoteForm}>
              <Send className="w-3.5 h-3.5 mr-1" /> Get Quote
            </Button>
          </div>
          <div className="flex gap-1.5 overflow-x-auto">
            {routeStops.map((s, i) => (
              <span key={s.id} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary whitespace-nowrap font-body">
                {i + 1}. {s.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Quote Request Modal */}
      <AnimatePresence>
        {showQuoteForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-background/80 backdrop-blur-xl flex items-center justify-center p-4"
            onClick={() => setShowQuoteForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              className="w-full max-w-lg glass-card overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {quoteSubmitted ? (
                /* Success state */
                <div className="p-10 text-center space-y-4">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                  >
                    <CheckCircle className="w-16 h-16 text-primary mx-auto" />
                  </motion.div>
                  <h3 className="font-display text-2xl font-semibold">Quote Requested!</h3>
                  <p className="text-sm text-muted-foreground font-body max-w-sm mx-auto">
                    Our safari specialists will craft a personalized itinerary for your {routeStops.length}-destination adventure and reach out within 24 hours.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 pt-2">
                    {routeStops.map((s) => (
                      <span key={s.id} className="text-xs px-3 py-1 rounded-full bg-primary/15 text-primary font-body">{s.name}</span>
                    ))}
                  </div>
                  <Button variant="hero" className="mt-6" onClick={() => setShowQuoteForm(false)}>
                    Back to Map
                  </Button>
                </div>
              ) : (
                /* Form */
                <>
                  <div className="p-6 border-b border-border/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-display text-xl font-semibold">Request Custom Quote</h3>
                        <p className="text-xs text-muted-foreground font-body mt-1">
                          {routeStops.length} destinations · {estimatedDays} days · ~${estimatedPrice.toLocaleString()}/person
                        </p>
                      </div>
                      <button onClick={() => setShowQuoteForm(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {routeStops.map((s, i) => (
                        <span key={s.id} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-body">
                          {i + 1}. {s.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {/* Name */}
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-1.5 block">Full Name *</label>
                      <Input
                        value={form.full_name}
                        onChange={(e) => updateField("full_name", e.target.value)}
                        placeholder="Your full name"
                        className="bg-muted/30 border-border/50 font-body"
                      />
                      {errors.full_name && <p className="text-destructive text-xs mt-1 font-body">{errors.full_name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-1.5 block">Email *</label>
                      <Input
                        type="email"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        placeholder="you@example.com"
                        className="bg-muted/30 border-border/50 font-body"
                      />
                      {errors.email && <p className="text-destructive text-xs mt-1 font-body">{errors.email}</p>}
                    </div>

                    {/* Phone + Guests row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-1.5 block">Phone</label>
                        <Input
                          type="tel"
                          value={form.phone}
                          onChange={(e) => updateField("phone", e.target.value)}
                          placeholder="+254 7..."
                          className="bg-muted/30 border-border/50 font-body"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-1.5 block">Guests</label>
                        <Input
                          type="number"
                          min={1}
                          max={50}
                          value={form.guests_count}
                          onChange={(e) => updateField("guests_count", parseInt(e.target.value) || 1)}
                          className="bg-muted/30 border-border/50 font-body"
                        />
                      </div>
                    </div>

                    {/* Preferred dates */}
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-1.5 block">Preferred Travel Dates</label>
                      <Input
                        value={form.preferred_dates}
                        onChange={(e) => updateField("preferred_dates", e.target.value)}
                        placeholder="e.g. August 2026, flexible"
                        className="bg-muted/30 border-border/50 font-body"
                      />
                    </div>

                    {/* Special requests */}
                    <div>
                      <label className="text-xs uppercase tracking-wider text-muted-foreground font-body mb-1.5 block">Special Requests</label>
                      <Textarea
                        value={form.special_requests}
                        onChange={(e) => updateField("special_requests", e.target.value)}
                        placeholder="Photography focus, family-friendly, hot air balloon, etc."
                        rows={3}
                        className="bg-muted/30 border-border/50 font-body resize-none"
                      />
                    </div>
                  </div>

                  <div className="p-6 border-t border-border/30">
                    <Button variant="hero" className="w-full" onClick={handleSubmitQuote} disabled={submitting}>
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                      ) : (
                        <><Send className="w-4 h-4 mr-2" /> Submit Quote Request</>
                      )}
                    </Button>
                    <p className="text-[10px] text-muted-foreground font-body text-center mt-3">
                      Our team typically responds within 24 hours
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SafariMap;
