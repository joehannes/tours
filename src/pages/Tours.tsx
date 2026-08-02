import React, { useState, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import TourCard from '../components/TourCard';
import { Tour, getTours, getServiceSlug } from '../services/toursService';
import { useI18n } from '../contexts/I18nContext';
import { useBrand } from '../contexts/BrandContext';

const Tours: React.FC = () => {
  const { locale } = useI18n();
  const { brandSettings } = useBrand();
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTours();
  }, [locale]);

  const loadTours = async () => {
    setLoading(true);
    const fetchedTours = await getTours(locale);
    setTours(fetchedTours);
    setLoading(false);
  };

  if (loading) {
    return <div className="grid min-h-screen place-items-center">Loading...</div>;
  }

  return (
    <div className="py-16">
      <div className="section-shell">
        <h1 className="mb-3 text-center text-5xl font-bold text-slate-900">
          <FormattedMessage id="tours.title" />
        </h1>
        <p className="mx-auto mb-12 max-w-2xl text-center text-slate-600">
          <FormattedMessage id="tours.dynamicSubtitle" values={{ brand: brandSettings.brandName }} />
        </p>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {tours.map((tour, index) => (
            <TourCard
              key={tour.id}
              image={tour.image}
              title={tour.title}
              description={tour.description}
              price={tour.price}
              pricingOptions={tour.pricingOptions}
              excursionName={tour.title}
              detailsPath={`/details/tours/${getServiceSlug(tour)}`}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Tours;

