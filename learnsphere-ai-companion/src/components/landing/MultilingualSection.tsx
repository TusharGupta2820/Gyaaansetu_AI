import { motion } from "framer-motion";
import { useState } from "react";
import { Globe, Check, Sparkles, Volume2 } from "lucide-react";

const LANGUAGES = [
  {
    code: "en",
    name: "English",
    native: "English",
    sample: "Quantum superposition allows particles to exist in multiple states simultaneously until measured."
  },
  {
    code: "hi",
    name: "Hindi",
    native: "हिन्दी",
    sample: "क्वांटम सुपरपोजिशन के अनुसार, कण एक ही समय में कई अवस्थाओं में तब तक रह सकते हैं जब तक उनका मापन न किया जाए।"
  },
  {
    code: "mr",
    name: "Marathi",
    native: "मराठी",
    sample: "क्वांटम सुपरपोझिशननुसार, मोजमाप करेपर्यंत कण एकाच वेळी अनेक स्थितींमध्ये अस्तित्वात राहू शकतात."
  },
  {
    code: "bn",
    name: "Bengali",
    native: "বাংলা",
    sample: "কোয়ান্টাম সুপারপজিশন অনুযায়ী, পরিমাপ না করা পর্যন্ত কণা একই সাথে একাধিক অবস্থায় থাকতে পারে।"
  },
  {
    code: "ta",
    name: "Tamil",
    native: "தமிழ்",
    sample: "குவாண்டம் சூப்பர்போசிஷன் கொள்கையின்படி, அளவிடப்படும் வரை துகள்கள் ஒரே நேரத்தில் பல நிலைகளில் இருக்க முடியும்."
  },
  {
    code: "te",
    name: "Telugu",
    native: "తెలుగు",
    sample: "క్వాంటమ్ సూపర్ పొజిషన్ ప్రకారం, కొలవబడే వరకు రేణువులు ఒకే సమయంలో అనేక స్థితులలో ఉండవచ్చు."
  },
  {
    code: "gu",
    name: "Gujarati",
    native: "ગુજરાતી",
    sample: "ક્વોન્ટમ સુપરપોઝિશન અનુસાર, જ્યાં સુધી માપવામાં ન આવે ત્યાં સુધી કણો એકસાથે અનેક સ્થિતિઓમાં રહી શકે છે."
  },
  {
    code: "kn",
    name: "Kannada",
    native: "ಕನ್ನಡ",
    sample: "ಕ್ವಾಂಟಮ್ ಸೂಪರ್ ಪೊಸಿಷನ್ ಪ್ರಕಾರ, ಅಳೆಯುವವರೆಗೆ ಕಣಗಳು ಒಂದೇ ಸಮಯದಲ್ಲಿ ಹಲವು ಸ್ಥಿತಿಗಳಲ್ಲಿ ಇರಬಹುದು."
  }
];

export function MultilingualSection() {
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[1]); // Default Hindi

  return (
    <section className="py-24 bg-slate-50 border-b border-slate-200/80 font-sans">
      <div className="w-full max-w-[1800px] mx-auto px-6 md:px-12 lg:px-16 space-y-16">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm font-semibold">
            <Globe className="w-4 h-4" />
            <span>Multilingual Accessibility</span>
          </div>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold text-slate-900 tracking-tight leading-tight">
            Learn in the language that <br className="hidden sm:inline" />
            <span className="text-blue-600">works for you.</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed font-normal">
            Language should never be a barrier to mastering complex concepts. GyaanSetu-AI explains technical topics across India's regional languages.
          </p>
        </motion.div>

        {/* Language Chips */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="flex flex-wrap justify-center gap-3 max-w-5xl mx-auto"
        >
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLang.code === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang)}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2.5 cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white shadow-md scale-105"
                    : "bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <span>{lang.native}</span>
                <span className={`text-xs font-normal ${isSelected ? "text-blue-200" : "text-slate-400"}`}>
                  ({lang.name})
                </span>
                {isSelected && <Check className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </motion.div>

        {/* Interactive Language Display Box - Navy Blue Card on Light BG */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-[#0b1530] text-white border border-sky-400/30 rounded-3xl p-8 shadow-xl space-y-5"
        >
          <div className="flex items-center justify-between border-b border-sky-900/60 pb-4">
            <div className="flex items-center gap-2.5 text-sm font-bold text-white">
              <Sparkles className="w-5 h-5 text-sky-400" />
              <span>GyaanSetu-AI Output — {selectedLang.native} ({selectedLang.name})</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-sky-300 bg-sky-900/60 font-semibold px-3 py-1 rounded-full border border-sky-400/30">
              <Volume2 className="w-3.5 h-3.5 text-sky-400" /> Audio Native
            </div>
          </div>

          <div className="p-5 bg-sky-950/80 border border-sky-800/60 rounded-2xl">
            <div className="text-xs font-semibold text-sky-300 mb-1.5 font-mono">Concept Explanation Sample:</div>
            <p className="text-white text-base sm:text-lg leading-relaxed font-medium">
              "{selectedLang.sample}"
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
