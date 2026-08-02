import React, { useMemo, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { generateWhatsAppMessage } from '../utils/whatsapp';
import { useBrand } from '../contexts/BrandContext';
import { PricingOption } from '../services/toursService';
import PaymentDropdown from './ui/PaymentDropdown';
import MarkdownRenderer from './ui/MarkdownRenderer';
import { playClickFx, playHoverFx } from '../lib/soundEngine';

interface TourCardProps {
  image: string;
  title: string;
  description: string;
  price: string;
  pricingOptions?: PricingOption[];
  excursionName: string;
  detailsPath: string;
  enabled?: boolean;
  showPrice?: boolean;
  showDetailsLink?: boolean;
  index?: number;
}

const TourCard: React.FC<TourCardProps> = ({
  image,
  title,
  description,
  price,
  pricingOptions = [],
  excursionName,
  detailsPath,
  enabled = true,
  showPrice = true,
  showDetailsLink = true,
  index = 0,
}) => {
  const intl = useIntl();
  const { brandSettings } = useBrand();
  const swayClass = `animate-wave-sway-${(index % 10) + 1}`;
  const resolvedPricingOptions = pricingOptions.length > 0
    ? pricingOptions
    : [{ tier: intl.locale === 'es' ? 'Personas' : 'People', price, amount: null }];
  const [selectedDate, setSelectedDate] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    resolvedPricingOptions.reduce<Record<string, number>>((accumulator, option, idx) => {
      accumulator[option.tier] = idx === 0 ? 1 : 0;
      return accumulator;
    }, {})
  );

  const totalAmount = useMemo(
    () =>
      resolvedPricingOptions.reduce((sum, option) => {
        const quantity = quantities[option.tier] ?? 0;
        return sum + (option.amount ?? 0) * quantity;
      }, 0),
    [quantities, resolvedPricingOptions]
  );

  const selectedQuantitySummary = resolvedPricingOptions
    .filter((option) => (quantities[option.tier] ?? 0) > 0)
    .map((option) => `${option.tier}: ${quantities[option.tier]}`)
    .join(', ');

  const formattedSelectedDate = selectedDate
    ? new Intl.DateTimeFormat(intl.locale === 'es' ? 'es-DO' : 'en-US', {
      dateStyle: 'full',
    }).format(new Date(`${selectedDate}T00:00:00`))
    : '';

  const handleQuantityChange = (tier: string, nextValue: string) => {
    const parsedValue = Math.max(0, Number(nextValue) || 0);
    setQuantities((current) => ({ ...current, [tier]: parsedValue }));
  };

  const handleBookNow = () => {
    playClickFx();
    let message = '';
    message += `Hello, I want to book ${excursionName} with Francisco Ferreras Tours\n`;
    message += `Participants: ${selectedQuantitySummary || 'N/A'}\n`;
    message += `Preferred date: ${formattedSelectedDate || 'Not specified'}\n`;
    message += `Price: ${totalAmount > 0 ? totalAmount : price} USD`;
    message += `\n`;
    message += `Hola, deseo reservar el ${excursionName} con Francisco Ferreras Tours\n`;
    message += `Participantes: ${selectedQuantitySummary || 'N/A'}\n`;
    message += `Fecha preferida: ${formattedSelectedDate || 'No especificada'}\n`;
    message += `Precio: ${totalAmount > 0 ? totalAmount : price} USD`;

    const whatsappUrl = generateWhatsAppMessage(brandSettings.phoneNumber, message);

    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <article
      onMouseEnter={() => playHoverFx()}
      className={`group break-inside-avoid inline-block w-full mb-8 flex h-auto flex-col justify-between overflow-hidden rounded-3xl artsy-glass-card ${swayClass} transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_30px_70px_rgba(6,29,43,0.28)]`}
    >
      {/* Media Frame */}
      <div className="relative overflow-hidden aspect-[16/10]">
        <Link to={detailsPath} onClick={() => playClickFx()} className="block h-full w-full" aria-label={title}>
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
        </Link>
        <div className="absolute left-4 top-4 artsy-brick-badge">
          <span>✦ VIP Excursion</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex h-full flex-col justify-between p-6 sm:p-7">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-teal-700">
                Francisco Ferreras Collection
              </span>
              <h3 className="mt-1 font-serif text-2xl font-bold tracking-tight text-[#04131D]">
                {title}
              </h3>
            </div>
            {showDetailsLink && (
              <Link
                to={detailsPath}
                onClick={() => playClickFx()}
                className="shrink-0 text-xs font-bold uppercase tracking-wider text-teal-700 underline decoration-teal-500/30 underline-offset-4 transition hover:decoration-teal-600"
              >
                <FormattedMessage id="details.view" defaultMessage="View Details" />
              </Link>
            )}
          </div>

          <div className="text-sm leading-relaxed text-slate-700">
            <MarkdownRenderer content={description} />
          </div>

          {showPrice && (
            <div className="flex flex-wrap gap-2 pt-1">
              {resolvedPricingOptions.map((option) => (
                <span
                  key={`${title}-${option.tier}`}
                  className="inline-flex items-center rounded-full bg-white/70 backdrop-blur-[3px] px-3.5 py-1 text-xs font-semibold text-[#04131D] border border-white/60 shadow-sm"
                >
                  {option.tier}: <strong className="ml-1 text-teal-700">{option.price}</strong>
                </span>
              ))}
            </div>
          )}
        </div>

        {enabled && (
          <div className="mt-6 space-y-4 border-t border-slate-200/60 pt-6">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {resolvedPricingOptions.map((option) => (
                <label key={option.tier} className="space-y-1.5 rounded-2xl border border-white/60 bg-white/60 backdrop-blur-[3px] p-3 text-left">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    {option.tier}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={quantities[option.tier] ?? 0}
                    onChange={(event) => handleQuantityChange(option.tier, event.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-[#04131D] outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  />
                </label>
              ))}
            </div>

            <label className="block space-y-1.5 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                <FormattedMessage id="tours.dateLabel" defaultMessage="Preferred Date" />
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-[#04131D] outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              />
            </label>

            <div className="flex items-center justify-between rounded-2xl bg-[#04131D] px-5 py-3.5 text-sm font-bold text-white shadow-md">
              <span className="text-xs uppercase tracking-wider text-slate-300">
                <FormattedMessage id="payment.total" defaultMessage="Total Estimate" />
              </span>
              <span className="text-lg font-serif text-amber-400">
                {totalAmount > 0 ? `$${totalAmount} USD` : price}
              </span>
            </div>

            <div className="space-y-3 pt-1">
              <button onClick={handleBookNow} className="tropical-button w-full justify-center">
                <FormattedMessage id="tours.bookNow" />
              </button>
              <div className="flex justify-center w-full">
                <PaymentDropdown
                  excursionTitle={title}
                  selectedPrice={totalAmount > 0 ? `$${totalAmount} USD` : price}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
};

export default TourCard;
