import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Navbar, SectionKey } from "@/components/landing/Navbar";
import { HeroSection } from "@/components/landing/HeroSection";
import { CapabilityStrip } from "@/components/landing/CapabilityStrip";
import { TrustBadgesSection } from "@/components/landing/TrustBadgesSection";
import { ProblemStorySection } from "@/components/landing/ProblemStorySection";
import { ProductPillarsSection } from "@/components/landing/ProductPillarsSection";
import { AITutorShowcase } from "@/components/landing/AITutorShowcase";
import { MultilingualSection } from "@/components/landing/MultilingualSection";
import { LearningPathSection } from "@/components/landing/LearningPathSection";
import { DashboardPreviewSection } from "@/components/landing/DashboardPreviewSection";
import { CareerGuidanceSection } from "@/components/landing/CareerGuidanceSection";
import { AudienceSection } from "@/components/landing/AudienceSection";
import { VoiceAccessibilitySection } from "@/components/landing/VoiceAccessibilitySection";
import { OfflineTechnologySection } from "@/components/landing/OfflineTechnologySection";
import { AnalyticsWellnessSection } from "@/components/landing/AnalyticsWellnessSection";
import { BrandPrinciplesSection } from "@/components/landing/BrandPrinciplesSection";
import { FinalCTASection } from "@/components/landing/FinalCTASection";
import { Footer } from "@/components/landing/Footer";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GyaanSetu-AI — Personalised AI Learning Platform" },
      {
        name: "description",
        content:
          "GyaanSetu-AI is a next-generation AI learning ecosystem bringing intelligent tutoring, adaptive learning paths, 22+ languages, and skill analytics together."
      }
    ]
  }),
  component: LandingPage
});

function LandingPage() {
  const [activeSection, setActiveSection] = useState<SectionKey>("home");

  const getSectionTitle = (key: SectionKey) => {
    switch (key) {
      case "product": return "Product Ecosystem";
      case "ai-tutor": return "AI Tutor Companion";
      case "learning": return "Personalised Learning & Multilingual";
      case "students": return "For Students & Command Center";
      case "educators": return "For Educators & Institutions";
      case "resources": return "Resources & Offline Technology";
      default: return "Home";
    }
  };

  return (
    <div id="main-content" className="bg-white text-slate-900 min-h-screen font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden antialiased">
      
      {/* 01. Sticky Header Navbar */}
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Top Banner Indicator for Dedicated Views */}
      {activeSection !== "home" && (
        <div className="pt-32 pb-4 px-6 md:px-12 bg-slate-900 text-white border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs shadow">
              GS
            </div>
            <div>
              <span className="text-xs font-mono text-blue-400 font-bold uppercase tracking-wider">
                Viewing Section:
              </span>
              <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                {getSectionTitle(activeSection)}
              </h2>
            </div>
          </div>

          <button
            onClick={() => setActiveSection("home")}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home Page
          </button>
        </div>
      )}

      {/* ── HOME PAGE CONTENT ONLY ── */}
      {activeSection === "home" && (
        <>
          <HeroSection />
          <CapabilityStrip />
          <TrustBadgesSection />
          <ProblemStorySection />
          <FinalCTASection />
        </>
      )}

      {/* ── PRODUCT PAGE CONTENT ONLY ── */}
      {activeSection === "product" && (
        <div className="pt-20">
          <ProductPillarsSection />
          <BrandPrinciplesSection />
          <FinalCTASection />
        </div>
      )}

      {/* ── AI TUTOR PAGE CONTENT ONLY ── */}
      {activeSection === "ai-tutor" && (
        <div className="pt-20">
          <AITutorShowcase />
          <FinalCTASection />
        </div>
      )}

      {/* ── LEARNING PAGE CONTENT ONLY ── */}
      {activeSection === "learning" && (
        <div className="pt-20">
          <LearningPathSection />
          <MultilingualSection />
          <CareerGuidanceSection />
          <FinalCTASection />
        </div>
      )}

      {/* ── FOR STUDENTS PAGE CONTENT ONLY ── */}
      {activeSection === "students" && (
        <div className="pt-20">
          <DashboardPreviewSection />
          <AudienceSection />
          <FinalCTASection />
        </div>
      )}

      {/* ── FOR EDUCATORS PAGE CONTENT ONLY ── */}
      {activeSection === "educators" && (
        <div className="pt-20">
          <AudienceSection />
          <AnalyticsWellnessSection />
          <FinalCTASection />
        </div>
      )}

      {/* ── RESOURCES PAGE CONTENT ONLY ── */}
      {activeSection === "resources" && (
        <div className="pt-20">
          <OfflineTechnologySection />
          <VoiceAccessibilitySection />
          <FinalCTASection />
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
