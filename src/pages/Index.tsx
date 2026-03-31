import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import StatsCounter from "@/components/landing/StatsCounter";
import RoomsShowcase from "@/components/landing/RoomsShowcase";
import DayTimeline from "@/components/landing/DayTimeline";
import SafariPackages from "@/components/landing/SafariPackages";
import BigFiveTracker from "@/components/landing/BigFiveTracker";
import SeasonalCalendar from "@/components/landing/SeasonalCalendar";
import WildlifeGallery from "@/components/landing/WildlifeGallery";
import ExperienceHighlights from "@/components/landing/ExperienceHighlights";
import About from "@/components/landing/About";
import Testimonials from "@/components/landing/Testimonials";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <StatsCounter />
      <RoomsShowcase />
      <DayTimeline />
      <SafariPackages />
      <BigFiveTracker />
      <SeasonalCalendar />
      <WildlifeGallery />
      <ExperienceHighlights />
      <About />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
