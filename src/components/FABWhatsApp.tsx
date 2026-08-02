import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { useBrand } from '../contexts/BrandContext';
import { generateWhatsAppMessage } from '../utils/whatsapp';
import { playClickFx, playHoverFx } from '../lib/soundEngine';

interface FABWhatsAppProps {
  phoneNumber?: string;
  message?: string;
}

const FABWhatsApp: React.FC<FABWhatsAppProps> = ({
  phoneNumber,
  message = 'Hola! Me gustaría información sobre los tours de Francisco Ferreras.'
}) => {
  const { brandSettings } = useBrand();
  const effectivePhone = phoneNumber || brandSettings.phoneNumber || '+18095553333';

  const handleClick = () => {
    playClickFx();
    window.open(generateWhatsAppMessage(effectivePhone, message), '_blank');
  };

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => playHoverFx()}
      className="whatsapp-fab fixed bottom-6 right-6 z-50 flex items-center justify-center h-14 px-5 gap-2.5 rounded-full bg-emerald-600 text-white shadow-[0_15px_35px_rgba(4,78,51,0.4)] border border-white/40 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-emerald-500 animate-fab-glow-wave"
      aria-label="Contact via WhatsApp"
      title="Chat with Francisco Ferreras Concierge on WhatsApp"
    >
      <FaWhatsapp className="w-7 h-7 text-white" />
      <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider text-white">
        WhatsApp Concierge
      </span>
    </button>
  );
};

export default FABWhatsApp;
