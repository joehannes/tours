import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { HiArrowDown, HiCheck, HiStar, HiShieldCheck } from 'react-icons/hi';
import { motion } from 'framer-motion';
import { useBrand } from '../contexts/BrandContext';
import SeaWaveDivider from './ui/SeaWaveDivider';
import { playClickFx, playHoverFx } from '../lib/soundEngine';

interface HeroProps {
  backgroundImage: string;
  backgroundImageMobile?: string;
  backgroundVideo?: string;
}

const Hero: React.FC<HeroProps> = ({ backgroundImage, backgroundImageMobile, backgroundVideo }) => {
  const { brandSettings } = useBrand();

  const desktopImage = backgroundImage || '/imgs/tours/tour_saona_island_detail_12.jpg';
  const mobileImage = backgroundImageMobile || desktopImage;

  return (
    <section className="relative bg-[#04131D] text-white isolate z-0 overflow-hidden w-full">
      {/* Background Media Container */}
      <div className="absolute inset-0 z-0 h-full w-full overflow-hidden pointer-events-none select-none">
        <div className="absolute inset-0 bg-[#04131D]" aria-hidden="true" />
        {backgroundVideo && (
          <video
            className="absolute inset-0 h-full w-full object-cover opacity-60"
            src={backgroundVideo}
            autoPlay
            muted
            loop
            playsInline
            poster={desktopImage}
            aria-hidden="true"
          />
        )}
        {!backgroundVideo && (
          <>
            {/* Mobile Background Image */}
            <div
              className="absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat pointer-events-none select-none md:hidden opacity-75"
              style={{ backgroundImage: `url(${mobileImage})` }}
              aria-hidden="true"
            />
            {/* Desktop Background Image */}
            <div
              className="absolute inset-0 h-full w-full bg-cover bg-center bg-no-repeat pointer-events-none select-none hidden md:block opacity-75"
              style={{ backgroundImage: `url(${desktopImage})` }}
              aria-hidden="true"
            />
          </>
        )}
      </div>

      {/* Subtle bottom-only gradient for headline legibility */}
      <div className="absolute inset-x-0 bottom-0 z-1 h-64 bg-gradient-to-t from-[#04131D] via-[#04131D]/60 to-transparent pointer-events-none" />

      {/* Main Hero Content */}
      <div className="section-shell relative z-10 flex min-h-[calc(100vh-5rem)] items-center py-20 lg:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          
          {/* Main Editorial Text & CTA Column */}
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8 xl:col-span-7"
          >
            {/* Location & Trust Kicker */}
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-teal-500/40 bg-teal-950/60 px-4 py-1.5 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">
                Saona Island · Catalina · Bávaro Coast
              </span>
            </div>

            {/* Editorial Main Headline */}
            <h1 className="mb-6 font-serif text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl drop-shadow-lg">
              <FormattedMessage id="hero.title" values={{ brand: brandSettings.brandName }} />
            </h1>

            {/* Subtitle */}
            <p className="mb-10 max-w-2xl text-lg font-light leading-relaxed text-slate-200 sm:text-xl drop-shadow-md">
              <FormattedMessage id="hero.subtitle" />
            </p>

            {/* Action CTAs */}
            <div className="mb-12 flex flex-col sm:flex-row flex-wrap gap-4">
              <Link
                to="/tours#top"
                onClick={() => playClickFx()}
                onMouseEnter={() => playHoverFx()}
                className="tropical-button"
              >
                <FormattedMessage id="hero.cta" />
              </Link>
              <Link
                to="/transport#top"
                onClick={() => playClickFx()}
                onMouseEnter={() => playHoverFx()}
                className="tropical-button-outline"
              >
                <FormattedMessage id="nav.transport" defaultMessage="Private Transport" />
              </Link>
              <Link
                to="/contact#top"
                onClick={() => playClickFx()}
                onMouseEnter={() => playHoverFx()}
                className="tropical-button-outline border-white/20 hover:border-white/40"
              >
                <FormattedMessage id="contact.title" defaultMessage="Concierge" />
              </Link>
            </div>

            {/* High-Trust Value Signals */}
            <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-300">
              <div className="flex items-center gap-2">
                <HiShieldCheck className="h-5 w-5 text-teal-400" />
                <span>Francisco Ferreras Licensed Crew</span>
              </div>
              <div className="flex items-center gap-2">
                <HiCheck className="h-5 w-5 text-amber-400" />
                <span>Instant WhatsApp Booking</span>
              </div>
              <div className="flex items-center gap-2">
                <HiCheck className="h-5 w-5 text-teal-400" />
                <span>VIP Excursion Guarantee</span>
              </div>
            </div>
          </motion.div>

          {/* Luxury Floating Rating Card Column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:col-span-4 lg:block xl:col-span-5"
          >
            <div className="relative mx-auto max-w-sm rounded-3xl border border-white/20 bg-white/10 p-7 shadow-2xl backdrop-blur-2xl transition-transform duration-500 hover:-translate-y-2 animate-wave-sway-1">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <HiStar key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-500/30">
                  4.99 / 5.0 Rating
                </span>
              </div>
              <blockquote className="mb-4 font-serif italic text-sm leading-relaxed text-slate-100">
                “Francisco Ferreras and his team provided the most unforgettable day of our trip! Complete VIP luxury on the water.”
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-teal-600 flex items-center justify-center font-bold text-white text-xs border border-white/20">
                  FF
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Sarah & Michael R.</div>
                  <div className="text-[0.7rem] text-slate-300">Saona VIP Excursion · Miami, FL</div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Wavy Sea Waves Section Divider at Bottom of Hero */}
      <div className="relative z-10 -mb-1">
        <SeaWaveDivider variant="deep-crest" colorClass="text-[#083b4c]" />
      </div>

      {/* Ocean Blue Water Gradient Band with Fleet Banner */}
      <div className="relative z-10 bg-gradient-to-r from-[#04131D] via-[#0a526d] to-[#04131D] py-4 text-center border-t border-cyan-400/20 shadow-2xl">
        <a
          href="#adventure_preview"
          onClick={() => playClickFx()}
          onMouseEnter={() => playHoverFx()}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-cyan-200 transition hover:text-white"
        >
          <span>Explore Francisco Ferreras Excursions</span>
          <HiArrowDown className="h-4 w-4 animate-bounce text-cyan-300" />
        </a>
      </div>

      <div className="relative z-10 -mb-1">
        <SeaWaveDivider variant="tall-swell" colorClass="text-[#04131D]/40 backdrop-blur-sm" />
      </div>
    </section>
  );
};

export default Hero;
