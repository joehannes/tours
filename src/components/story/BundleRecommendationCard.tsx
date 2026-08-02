import React from 'react';
import { useStory } from '../../contexts/StoryContext';
import { useIntl } from 'react-intl';
import { FaWhatsapp, FaUndo, FaCar, FaStar, FaCheckCircle, FaCompass } from 'react-icons/fa';

export const BundleRecommendationCard: React.FC = () => {
  const { recommendedBundle, getWhatsAppUrl, resetStory, toggleMode } = useStory();
  const intl = useIntl();

  if (!recommendedBundle) {
    return (
      <div className="p-8 text-center text-white bg-slate-900/80 rounded-3xl backdrop-blur-xl">
        <p>No bundle calculated yet.</p>
        <button onClick={resetStory} className="mt-4 px-6 py-2 bg-teal-500 rounded-xl text-slate-950 font-bold">
          Start Over
        </button>
      </div>
    );
  }

  const whatsappUrl = getWhatsAppUrl(intl.locale);

  return (
    <div className="w-full max-w-4xl mx-auto rounded-[36px] p-6 sm:p-10 backdrop-blur-2xl bg-slate-950/90 border border-teal-400/50 text-white shadow-[0_30px_80px_rgba(4,19,29,0.8),0_0_50px_rgba(13,148,136,0.3)] animate-fadeIn">
      {/* Header Banner */}
      <div className="text-center mb-8">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-teal-500/20 to-amber-500/20 border border-teal-400/40 text-teal-300 font-semibold text-xs uppercase tracking-widest shadow-lg">
          <FaStar className="text-amber-300" /> Curated Excursion & Transport Bundle
        </span>
        <h2 className="text-3xl sm:text-5xl font-bold font-['Playfair_Display',serif] text-white tracking-tight mt-3 mb-2">
          {recommendedBundle.title}
        </h2>
        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto font-['Poppins',sans-serif]">
          {recommendedBundle.subtitle}
        </p>
      </div>

      {/* Recommended Excursions Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Primary Tour */}
        <div className="rounded-3xl p-6 bg-white/5 border border-white/10 hover:border-teal-400/40 transition-all duration-300">
          <div className="relative h-44 rounded-2xl overflow-hidden mb-4">
            <img
              src={recommendedBundle.primaryTour.image}
              alt={recommendedBundle.primaryTour.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-3 left-3 bg-teal-500 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full shadow-lg">
              Main Attraction
            </span>
          </div>
          <h3 className="text-xl font-bold text-white font-['Playfair_Display',serif] mb-2">
            {recommendedBundle.primaryTour.name}
          </h3>
          <p className="text-sm text-slate-300 font-['Poppins',sans-serif] mb-3">
            {recommendedBundle.primaryTour.description}
          </p>
          <div className="flex justify-between items-center text-sm font-semibold text-teal-300 border-t border-white/10 pt-3">
            <span>Estimated Value:</span>
            <span>${recommendedBundle.primaryTour.estimatedPriceUSD} USD</span>
          </div>
        </div>

        {/* Secondary Tour if present */}
        {recommendedBundle.secondaryTour && (
          <div className="rounded-3xl p-6 bg-white/5 border border-white/10 hover:border-amber-400/40 transition-all duration-300">
            <div className="relative h-44 rounded-2xl overflow-hidden mb-4">
              <img
                src={recommendedBundle.secondaryTour.image}
                alt={recommendedBundle.secondaryTour.name}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 bg-amber-400 text-slate-950 text-xs font-extrabold px-3 py-1 rounded-full shadow-lg">
                Complementary Experience
              </span>
            </div>
            <h3 className="text-xl font-bold text-white font-['Playfair_Display',serif] mb-2">
              {recommendedBundle.secondaryTour.name}
            </h3>
            <p className="text-sm text-slate-300 font-['Poppins',sans-serif] mb-3">
              {recommendedBundle.secondaryTour.description}
            </p>
            <div className="flex justify-between items-center text-sm font-semibold text-amber-300 border-t border-white/10 pt-3">
              <span>Estimated Value:</span>
              <span>${recommendedBundle.secondaryTour.estimatedPriceUSD} USD</span>
            </div>
          </div>
        )}
      </div>

      {/* Private Transport Section */}
      {recommendedBundle.transportService && (
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-teal-900/30 via-slate-900/40 to-amber-900/30 border border-teal-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 text-2xl shrink-0">
              <FaCar />
            </div>
            <div>
              <h4 className="text-lg font-bold text-white">
                {recommendedBundle.transportService.name}
              </h4>
              <p className="text-sm text-slate-300 font-['Poppins',sans-serif]">
                {recommendedBundle.transportService.description}
              </p>
            </div>
          </div>
          <span className="px-4 py-2 rounded-xl bg-teal-400/20 text-teal-300 text-sm font-bold border border-teal-400/30 shrink-0">
            +${recommendedBundle.transportService.estimatedPriceUSD} USD
          </span>
        </div>
      )}

      {/* Key Highlights */}
      <div className="mb-8 p-6 rounded-3xl bg-white/5 border border-white/10">
        <h4 className="text-lg font-bold text-amber-300 font-['Playfair_Display',serif] mb-3">
          Bundle Highlights & Guarantees
        </h4>
        <div className="grid sm:grid-cols-3 gap-3">
          {recommendedBundle.summaryHighlights.map((highlight, idx) => (
            <div key={idx} className="flex items-center gap-2.5 text-sm text-slate-200 font-['Poppins',sans-serif]">
              <FaCheckCircle className="text-emerald-400 text-base shrink-0" />
              <span>{highlight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Summary & Action Callouts */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-slate-950 border border-white/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-widest block mb-1">
            Bundle Savings ({recommendedBundle.packageDiscountPercent}% Off)
          </span>
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-extrabold text-teal-300 font-['Playfair_Display',serif]">
              ${recommendedBundle.finalPriceUSD} USD
            </span>
            <span className="text-lg text-slate-400 line-through">
              ${recommendedBundle.totalEstimatedPriceUSD} USD
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">Includes all taxes, booking fees & direct host coordination</p>
        </div>

        {/* WhatsApp & Navigation Actions */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-none px-6 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-base shadow-[0_10px_30px_rgba(16,185,129,0.4)] transition-all duration-300 transform hover:-translate-y-0.5 flex items-center justify-center gap-3"
          >
            <FaWhatsapp className="text-2xl" /> Book Directly on WhatsApp
          </a>

          <button
            onClick={toggleMode}
            className="px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all flex items-center gap-2"
          >
            <FaCompass /> See All Tours
          </button>

          <button
            onClick={resetStory}
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10 transition-all"
            title="Start Over"
          >
            <FaUndo />
          </button>
        </div>
      </div>
    </div>
  );
};
