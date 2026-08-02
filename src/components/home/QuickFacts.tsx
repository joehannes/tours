import React from 'react';
import { usePlanner } from '../../contexts/PlannerContext';
import { useI18n } from '../../contexts/I18nContext';

/**
 * A slim band of hard facts under the hero. The excursion count comes from the
 * live catalogue the planner already loaded, so it can never drift from truth.
 */
const QuickFacts: React.FC = () => {
  const { catalogue } = usePlanner();
  const { locale } = useI18n();
  const isEs = locale === 'es';

  const facts = [
    {
      value: catalogue.length > 0 ? String(catalogue.length) : '—',
      label: isEs ? 'excursiones seleccionadas' : 'curated excursions',
    },
    { value: '4.99', label: isEs ? 'valoración media' : 'average guest rating' },
    { value: '24/7', label: isEs ? 'respuesta por WhatsApp' : 'WhatsApp response' },
    {
      value: isEs ? 'Incluido' : 'Included',
      label: isEs ? 'recogida en el hotel' : 'hotel pick-up & drop-off',
    },
  ];

  return (
    <section className="wavy-band relative z-10 bg-white/45 backdrop-blur-xl">
      <div className="section-shell grid grid-cols-2 gap-6 py-14 sm:py-16 md:grid-cols-4">
        {facts.map((fact) => (
          <div key={fact.label} className="text-center">
            <div className="font-serif text-2xl font-bold text-[#04131D] sm:text-3xl">{fact.value}</div>
            <div className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.14em] text-teal-800/80">
              {fact.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default QuickFacts;
