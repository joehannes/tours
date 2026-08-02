import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { FaPlayCircle, FaMapPin, FaClock, FaUsers } from 'react-icons/fa';
import { useBrand } from '../contexts/BrandContext';
import { generateWhatsAppMessage } from '../utils/whatsapp';
import { playClickFx, playHoverFx } from '../lib/soundEngine';

interface Adventure {
  id: string;
  title: string;
  emoji: string;
  duration: string;
  vibe: string;
  description: string;
  highlights: string[];
  bestFor: string;
  vimeoUrl: string;
  imageUrl: string;
  mood: string;
}

interface AdventureCardProps {
  adventure: Adventure;
  onBook?: (adventureId: string) => void;
  index?: number;
}

const AdventureCard: React.FC<AdventureCardProps> = ({ adventure, onBook, index = 0 }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const navigate = useNavigate();
  const { brandSettings } = useBrand();
  const whatsappPhone = brandSettings.phoneNumber || '+18095553333';
  const swayClass = `animate-wave-sway-${(index % 10) + 1}`;

  const handleWhatsAppClick = () => {
    playClickFx();
    const message = `Hola! Me gustaría más información sobre: ${adventure.title} con Francisco Ferreras Tours`;
    window.open(generateWhatsAppMessage(whatsappPhone, message), '_blank');
  };

  const detailPaths: Record<string, string> = {
    buggy: '/details/tours/2-buggies-adventure',
    party_boat: '/details/tours/3-party-boat-experience',
    waterfall: '/tours'
  };

  const handleShowDetails = () => {
    playClickFx();
    navigate(detailPaths[adventure.id] || '/tours');
  };

  return (
    <div
      onMouseEnter={() => playHoverFx()}
      className={`group flex h-full flex-col overflow-hidden rounded-[28px] artsy-glass-card ${swayClass} transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_36px_100px_rgba(8,42,62,.24),0_12px_24px_rgba(23,182,168,.14)] sm:rounded-[32px]`}
    >
      {/* Image container */}
      <div className="relative h-60 overflow-hidden bg-slate-200 sm:h-64 md:h-80">
        <img
          src={adventure.imageUrl}
          alt={adventure.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#04131D]/85 via-[#04131D]/15 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        {/* Video button overlay */}
        {!showVideo && (
          <button
            onClick={() => {
              playClickFx();
              setShowVideo(true);
            }}
            className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100"
          >
            <FaPlayCircle className="text-white text-6xl drop-shadow-lg hover:scale-110 transition-transform" />
          </button>
        )}

        {/* Emoji badge */}
        <div className="absolute right-4 top-4 rounded-full bg-white/90 p-3 text-3xl shadow-lg backdrop-blur border border-white/60">
          {adventure.emoji}
        </div>
      </div>

      {/* Video embed */}
      {showVideo && (
        <div className="relative w-full bg-black aspect-video">
          <iframe
            width="100%"
            height="100%"
            src={adventure.vimeoUrl.replace('vimeo.com', 'player.vimeo.com/video')}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={adventure.title}
          />
          <button
            onClick={() => {
              playClickFx();
              setShowVideo(false);
            }}
            className="absolute top-2 right-2 z-10 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-full text-xs font-bold"
          >
            Close Video
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="mb-3 font-serif text-2xl font-bold leading-tight text-[#04131D]">{adventure.title}</h3>

        {/* Quick info */}
        <div className="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold uppercase tracking-wider">
          <div className="flex items-center gap-1.5 text-teal-700">
            <FaClock className="text-base" />
            <span>{adventure.duration}</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-600">
            <FaUsers className="text-base" />
            <span>{adventure.vibe}</span>
          </div>
        </div>

        {/* Description */}
        <p className="mb-4 flex-1 italic leading-relaxed text-slate-700">{adventure.description}</p>

        {/* Expandable section */}
        <div
          className={`overflow-hidden transition-all duration-300 ${
            isExpanded ? 'max-h-96' : 'max-h-0'
          }`}
        >
          <div className="mt-4 border-t border-slate-200/80 pt-4">
            <div className="mb-4">
              <h4 className="font-bold text-slate-900 mb-2">
                <FormattedMessage id="story.highlights" />
              </h4>
              <ul className="space-y-2">
                {adventure.highlights.map((highlight, idx) => (
                  <li key={idx} className="flex gap-2 text-sm text-slate-600">
                    <span className="font-bold text-teal-600">✓</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <h4 className="font-bold text-slate-900 mb-2">
                <FormattedMessage id="story.bestFor" />
              </h4>
              <p className="text-sm text-slate-600">{adventure.bestFor}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {adventure.mood.split(', ').map((mood, idx) => (
                <span
                  key={idx}
                  className="rounded-full bg-white/80 border border-white/60 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm"
                >
                  {mood}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => {
              playClickFx();
              setIsExpanded(!isExpanded);
            }}
            className="flex-1 rounded-full bg-slate-900 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-teal-700"
          >
            {isExpanded ? 'Show Less' : 'Details'}
          </button>
          <button
            onClick={handleWhatsAppClick}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-emerald-500 shadow-md"
          >
            <FaMapPin className="text-base" />
            Book Now
          </button>
          <button
            onClick={handleShowDetails}
            className="flex flex-1 items-center justify-center rounded-full border border-slate-300 bg-white/80 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-900 transition-all hover:border-teal-600 hover:text-teal-700"
          >
            All Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdventureCard;
