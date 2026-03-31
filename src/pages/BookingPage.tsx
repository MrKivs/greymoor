import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Users,
  Bed,
  Map,
  CheckCircle,
  Star,
  MapPin,
  Clock,
  Mountain,
  Sparkles,
} from "lucide-react";
import MagneticButton from "@/components/animations/MagneticButton";

const STEPS = ["Dates", "Room", "Safari", "Review"];

const BookingPage = () => {
  const navigate = useNavigate();
  const { session, user, loading: authLoading } = useAuth();
  const { formatPrice } = useCurrency();
  const [step, setStep] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedSafari, setSelectedSafari] = useState<string | null>(null);
  const [specialRequests, setSpecialRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ALL hooks must be called unconditionally (Rules of Hooks)
  const { data: rooms = [] } = useQuery({
    queryKey: ["booking-rooms"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rooms").select("*").eq("status", "available").order("price_per_night");
      if (error) throw error;
      return data;
    },
    enabled: !!session, // only fetch when logged in
  });

  const { data: safaris = [] } = useQuery({
    queryKey: ["booking-safaris"],
    queryFn: async () => {
      const { data, error } = await supabase.from("safari_packages").select("*").eq("status", "active").order("price_per_person");
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  const room = rooms.find((r) => r.id === selectedRoom);
  const safari = safaris.find((s) => s.id === selectedSafari);

  const totalNights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    return Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
  }, [checkIn, checkOut]);

  const roomSubtotal = room ? Number(room.price_per_night) * totalNights : 0;
  const safariSubtotal = safari ? Number(safari.price_per_person) * guests : 0;
  const taxes = Math.round((roomSubtotal + safariSubtotal) * 0.16);
  const grandTotal = roomSubtotal + safariSubtotal + taxes;

  const canProceed = () => {
    if (step === 0) return checkIn && checkOut && totalNights > 0;
    if (step === 1) return !!selectedRoom;
    if (step === 2) return true; // safari is optional
    return true;
  };

  const handleSubmit = async () => {
    if (!session || !user) {
      toast.error("Please sign in to complete your booking");
      navigate("/login", { state: { from: "/book" } });
      return;
    }
    if (!selectedRoom) return;

    setSubmitting(true);
    try {
      const { error } = await supabase.from("bookings").insert([{
        customer_id: user.id,
        room_id: selectedRoom,
        safari_package_id: selectedSafari || null,
        check_in: checkIn,
        check_out: checkOut,
        guests_count: guests,
        total_nights: totalNights,
        room_subtotal: roomSubtotal,
        safari_subtotal: safariSubtotal,
        taxes,
        grand_total: grandTotal,
        special_requests: specialRequests || null,
      }]);
      if (error) {
        console.error("Booking insert error:", error);
        throw new Error(error.message);
      }
      toast.success("Booking submitted! We'll confirm shortly. 🎉");
      navigate("/guest/dashboard");
    } catch (e: any) {
      toast.error(e.message || "Booking failed — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  const roomTypeImages: Record<string, string> = {
    standard: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=85",
    deluxe: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=85",
    suite: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=85",
    villa: "https://images.unsplash.com/photo-1595521624992-48a59aef95e3?w=600&q=85",
  };

  const difficultyColor: Record<string, string> = {
    easy: "text-green-400",

    moderate: "text-primary",
    challenging: "text-accent",
    extreme: "text-destructive",
  };

  // ── Auth guard — placed after ALL hooks to follow Rules of Hooks ──────────
  // While Supabase is restoring the session from storage, show a spinner
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Once auth is resolved and there's definitely no session, show sign-in prompt
  if (!session) {
    return (
      <div className="min-h-screen bg-background grain-overlay flex items-center justify-center px-6">
        <div className="glass-card p-10 max-w-md text-center">
          <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="font-display text-3xl mb-3">Sign In to Book</h1>
          <p className="text-muted-foreground font-body mb-6">
            Create an account or sign in to start your Greymoor safari experience.
          </p>
          <Button
            variant="hero"
            size="lg"
            onClick={() => navigate("/login", { state: { from: "/book" } })}
            className="w-full"
          >
            Sign In / Register
          </Button>
          <button
            onClick={() => navigate("/")}
            className="mt-4 text-sm text-muted-foreground hover:text-foreground font-body transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background grain-overlay">
      {/* Hero header */}
      <div className="relative h-[40vh] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1920&q=80"
          alt="Lodge at sunset"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-4xl sm:text-5xl lg:text-6xl font-light mb-4"
            >
              Craft Your <span className="text-gradient-gold">Dream Escape</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground font-body max-w-lg mx-auto"
            >
              Select your dates, choose your room, and add a safari adventure — all in one seamless experience.
            </motion.p>
          </div>
        </div>
        <button onClick={() => navigate("/")} className="absolute top-6 left-6 z-20 glass-card px-4 py-2 text-sm font-body flex items-center gap-2 hover:bg-muted/50 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>

      <div className="container mx-auto px-6 -mt-12 relative z-20 pb-20">
        {/* Step indicators */}
        <div className="glass-card p-4 mb-8 flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body transition-all ${
                  i === step
                    ? "bg-primary text-primary-foreground"
                    : i < step
                    ? "bg-primary/10 text-primary cursor-pointer"
                    : "text-muted-foreground"
                }`}
              >
                {i < step ? <CheckCircle className="w-4 h-4" /> : <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-xs">{i + 1}</span>}
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < STEPS.length - 1 && <div className="w-8 h-px bg-border/50" />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {/* Step 0: Dates */}
            {step === 0 && (
              <div className="glass-card p-8 max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-8 h-8 text-primary" />
                  <div>
                    <h2 className="font-display text-2xl">When are you arriving?</h2>
                    <p className="text-sm text-muted-foreground font-body">Select your check-in and check-out dates</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label className="font-body text-muted-foreground">Check-in Date</Label>
                    <Input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} min={new Date().toISOString().split("T")[0]} className="bg-background/50 border-border/50 mt-1" />
                  </div>
                  <div>
                    <Label className="font-body text-muted-foreground">Check-out Date</Label>
                    <Input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} min={checkIn || new Date().toISOString().split("T")[0]} className="bg-background/50 border-border/50 mt-1" />
                  </div>
                </div>
                <div className="mb-6">
                  <Label className="font-body text-muted-foreground">Number of Guests</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-10 h-10 rounded-lg border border-border/50 flex items-center justify-center text-lg hover:bg-muted/50 transition-colors">−</button>
                    <span className="text-2xl font-display font-semibold w-8 text-center">{guests}</span>
                    <button onClick={() => setGuests(Math.min(10, guests + 1))} className="w-10 h-10 rounded-lg border border-border/50 flex items-center justify-center text-lg hover:bg-muted/50 transition-colors">+</button>
                    <Users className="w-5 h-5 text-muted-foreground ml-2" />
                  </div>
                </div>
                {totalNights > 0 && (
                  <div className="glass-card p-4 bg-primary/5 border-primary/20">
                    <p className="text-sm font-body"><span className="text-primary font-semibold">{totalNights} night{totalNights > 1 ? "s" : ""}</span> · {guests} guest{guests > 1 ? "s" : ""}</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Room Selection */}
            {step === 1 && (
              <div>
                <div className="text-center mb-8">
                  <Bed className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h2 className="font-display text-2xl">Choose Your Room</h2>
                  <p className="text-sm text-muted-foreground font-body">{totalNights} night{totalNights > 1 ? "s" : ""} · {guests} guest{guests > 1 ? "s" : ""}</p>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {rooms.filter((r) => r.capacity >= guests).map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRoom(r.id)}
                      className={`glass-card-hover text-left overflow-hidden transition-all ${
                        selectedRoom === r.id ? "ring-2 ring-primary shadow-[0_0_30px_hsl(var(--amber)/0.2)]" : ""
                      }`}
                    >
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={roomTypeImages[r.room_type] || roomTypeImages.standard}
                          alt={r.room_number}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                        {selectedRoom === r.id && (
                          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-primary-foreground" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className="glass-card px-2 py-1 text-xs font-body capitalize">{r.room_type}</span>
                        </div>
                      </div>
                      <div className="p-5">
                        <h3 className="font-display text-lg font-semibold mb-1">Room {r.room_number}</h3>
                        <p className="text-xs text-muted-foreground font-body mb-3">{r.description || `${r.room_type} room on floor ${r.floor}`}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground font-body">
                            <Users className="w-3.5 h-3.5" /> Up to {r.capacity}
                          </div>
                          <div>
                            <span className="text-xl font-display font-semibold">{formatPrice(Number(r.price_per_night))}</span>
                            <span className="text-xs text-muted-foreground font-body">/night</span>
                          </div>
                        </div>
                        {selectedRoom === r.id && (
                          <div className="mt-3 pt-3 border-t border-border/30 text-sm font-body text-primary font-medium">
                          Total: {formatPrice(Number(r.price_per_night) * totalNights)} for {totalNights} nights
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                  {rooms.filter((r) => r.capacity >= guests).length === 0 && (
                    <div className="col-span-full glass-card p-12 text-center">
                      <Bed className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="font-display text-xl mb-2">No Rooms Available</p>
                      <p className="text-sm text-muted-foreground font-body">Try adjusting guest count or dates.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Safari Selection */}
            {step === 2 && (
              <div>
                <div className="text-center mb-8">
                  <Map className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h2 className="font-display text-2xl">Add a Safari Adventure</h2>
                  <p className="text-sm text-muted-foreground font-body">Optional — enhance your stay with a curated expedition</p>
                </div>

                {/* Skip option */}
                <div className="text-center mb-6">
                  <button
                    onClick={() => { setSelectedSafari(null); setStep(3); }}
                    className="text-sm text-muted-foreground font-body hover:text-primary transition-colors underline underline-offset-4"
                  >
                    Skip — I'll just enjoy the lodge
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  {safaris.map((s) => {
                    const destinations = Array.isArray(s.destinations) ? s.destinations : [];
                    const highlights = Array.isArray(s.highlights) ? s.highlights : [];
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedSafari(s.id === selectedSafari ? null : s.id)}
                        className={`glass-card-hover text-left overflow-hidden transition-all ${
                          selectedSafari === s.id ? "ring-2 ring-primary shadow-[0_0_30px_hsl(var(--amber)/0.2)]" : ""
                        }`}
                      >
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={s.cover_image || "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=600&q=85"}
                            alt={s.name}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                          {selectedSafari === s.id && (
                            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                              <CheckCircle className="w-5 h-5 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="p-5">
                          <h3 className="font-display text-lg font-semibold mb-2">{s.name}</h3>
                          <div className="flex flex-wrap gap-3 mb-3 text-xs text-muted-foreground font-body">
                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {s.duration_days} Days</span>
                            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Max {s.max_group_size}</span>
                            <span className={`flex items-center gap-1 ${difficultyColor[s.difficulty_level] || "text-muted-foreground"}`}>
                              <Mountain className="w-3.5 h-3.5" /> {s.difficulty_level}
                            </span>
                          </div>
                          {highlights.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {(highlights as string[]).slice(0, 3).map((h) => (
                                <span key={h} className="text-[10px] px-2 py-0.5 rounded-full border border-border/50 text-muted-foreground font-body">{h}</span>
                              ))}
                            </div>
                          )}
                          <div className="flex items-center justify-between pt-3 border-t border-border/30">
                            <div>
                              <span className="text-xl font-display font-semibold">{formatPrice(Number(s.price_per_person))}</span>
                              <span className="text-xs text-muted-foreground font-body">/person</span>
                            </div>
                            {selectedSafari === s.id && (
                              <span className="text-sm font-body text-primary font-medium">
                                {formatPrice(Number(s.price_per_person) * guests)} total
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  {safaris.length === 0 && (
                    <div className="col-span-full glass-card p-12 text-center">
                      <Map className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="font-display text-xl mb-2">No Safari Packages</p>
                      <p className="text-sm text-muted-foreground font-body">Safari packages will appear once added by admin.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
                  <h2 className="font-display text-2xl">Review Your Booking</h2>
                </div>

                <div className="glass-card p-8 space-y-6">
                  {/* Dates */}
                  <div className="flex items-center gap-4 pb-4 border-b border-border/30">
                    <Calendar className="w-6 h-6 text-primary" />
                    <div>
                      <p className="font-body font-medium">{checkIn} → {checkOut}</p>
                      <p className="text-xs text-muted-foreground font-body">{totalNights} nights · {guests} guests</p>
                    </div>
                  </div>

                  {/* Room */}
                  {room && (
                    <div className="flex gap-4 pb-4 border-b border-border/30">
                      <img src={roomTypeImages[room.room_type] || roomTypeImages.standard} alt={room.room_number} className="w-20 h-20 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-display font-semibold">Room {room.room_number} <span className="capitalize text-xs text-muted-foreground font-body">({room.room_type})</span></p>
                        <p className="text-xs text-muted-foreground font-body">{formatPrice(Number(room.price_per_night))} × {totalNights} nights</p>
                      </div>
                      <p className="font-display font-semibold text-lg">{formatPrice(roomSubtotal)}</p>
                    </div>
                  )}

                  {/* Safari */}
                  {safari && (
                    <div className="flex gap-4 pb-4 border-b border-border/30">
                      <img src={safari.cover_image || "https://images.unsplash.com/photo-1547970810-dc1eac37d174?w=200&q=85"} alt={safari.name} className="w-20 h-20 rounded-lg object-cover" />
                      <div className="flex-1">
                        <p className="font-display font-semibold">{safari.name}</p>
                        <p className="text-xs text-muted-foreground font-body">{formatPrice(Number(safari.price_per_person))} × {guests} guests</p>
                      </div>
                      <p className="font-display font-semibold text-lg">{formatPrice(safariSubtotal)}</p>
                    </div>
                  )}

                  {/* Special requests */}
                  <div>
                    <Label className="font-body text-muted-foreground">Special Requests (optional)</Label>
                    <Textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Airport transfer, dietary needs, celebration..."
                      className="bg-background/50 border-border/50 mt-2"
                      rows={3}
                    />
                  </div>

                  {/* Totals */}
                  <div className="space-y-2 pt-4 border-t border-border/30">
                    <div className="flex justify-between text-sm font-body text-muted-foreground">
                      <span>Room subtotal</span><span>{formatPrice(roomSubtotal)}</span>
                    </div>
                    {safariSubtotal > 0 && (
                      <div className="flex justify-between text-sm font-body text-muted-foreground">
                        <span>Safari subtotal</span><span>{formatPrice(safariSubtotal)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-body text-muted-foreground">
                      <span>Taxes (16%)</span><span>{formatPrice(taxes)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-display font-bold pt-3 border-t border-border/30">
                      <span>Grand Total</span>
                      <span className="text-gradient-gold">{formatPrice(grandTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mt-8 max-w-2xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => step === 0 ? navigate("/") : setStep(step - 1)}
            className="font-body"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> {step === 0 ? "Home" : "Back"}
          </Button>

          {step < 3 ? (
            <MagneticButton>
              <Button
                variant="hero"
                size="lg"
                disabled={!canProceed()}
                onClick={() => setStep(step + 1)}
                className="px-8"
              >
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </MagneticButton>
          ) : (
            <MagneticButton>
              <Button
                variant="hero"
                size="lg"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-10"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" /> Confirm Booking
                  </>
                )}
              </Button>
            </MagneticButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
