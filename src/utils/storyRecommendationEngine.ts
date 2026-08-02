export interface UserAnswers {
  partyType?: 'solo' | 'couple' | 'family' | 'friends' | 'vip_private';
  vibe?: 'water_chill' | 'jungle_thrill' | 'party_nightlife' | 'culture_history' | 'vip_luxury';
  transportNeeded?: boolean;
}

export interface RecommendedBundle {
  title: string;
  subtitle: string;
  themeVariant: 'ocean_blue' | 'sunset_gold' | 'jungle_green' | 'vip_obsidian';
  primaryTour: {
    name: string;
    description: string;
    image: string;
    estimatedPriceUSD: number;
  };
  secondaryTour?: {
    name: string;
    description: string;
    image: string;
    estimatedPriceUSD: number;
  };
  transportService?: {
    name: string;
    description: string;
    estimatedPriceUSD: number;
  };
  totalEstimatedPriceUSD: number;
  packageDiscountPercent: number;
  finalPriceUSD: number;
  summaryHighlights: string[];
}

export function computeRecommendation(answers: UserAnswers, locale: string = 'en'): RecommendedBundle {
  const party = answers.partyType || 'couple';
  const vibe = answers.vibe || 'water_chill';
  const transport = answers.transportNeeded ?? false;
  const isEs = locale.startsWith('es');

  // Default theme fallback
  let themeVariant: 'ocean_blue' | 'sunset_gold' | 'jungle_green' | 'vip_obsidian' = 'ocean_blue';

  if (vibe === 'jungle_thrill') themeVariant = 'jungle_green';
  else if (vibe === 'party_nightlife' || vibe === 'culture_history') themeVariant = 'sunset_gold';
  else if (vibe === 'vip_luxury' || party === 'vip_private') themeVariant = 'vip_obsidian';

  // Rule Matrix computation
  if (party === 'vip_private' || vibe === 'vip_luxury') {
    const baseTotal = 380 + (transport ? 120 : 0);
    return {
      title: isEs ? 'Experiencia VIP Suprema en Yate & Langosta' : 'Ultimate VIP Yacht & Lobster Experience',
      subtitle: isEs ? 'Exclusividad total en Playa Catuano con chofer privado' : 'Total exclusivity at Catuano Beach with private chauffeur',
      themeVariant: 'vip_obsidian',
      primaryTour: {
        name: isEs ? 'Isla Saona VIP: Banquete de Langosta & Yate Privado' : 'Saona Island Exclusive: VIP Lobster Feast & Private Boat',
        description: isEs ? 'Catamarán de lujo, cabaña privada en la playa, langosta a la parrilla y piscina natural.' : 'Luxury boat, private beach cabana, fresh grilled lobster, and natural pool.',
        image: 'https://cdn.pixabay.com/photo/2016/11/19/14/00/beach-1836467_1280.jpg',
        estimatedPriceUSD: 280,
      },
      secondaryTour: {
        name: isEs ? 'Vuelo Doble en Paracaídas sobre Bávaro' : 'Sky-High Tandem Parasail over Bávaro',
        description: isEs ? 'Vuela a 100 metros de altura observando los arrecifes de Bávaro.' : 'Soar 300 feet above Bávaro’s turquoise coastline.',
        image: 'https://cdn.pixabay.com/photo/2016/11/22/19/18/boat-1850214_1280.jpg',
        estimatedPriceUSD: 100,
      },
      transportService: transport
        ? {
            name: isEs ? 'Traslado Privado en Chevrolet Suburban / Van' : 'Private Luxury Chauffeur SUV / Van',
            description: isEs ? 'Servicio personalizado de chofer privado ida y vuelta desde tu hotel.' : 'Door-to-door private SUV transfer with personal driver.',
            estimatedPriceUSD: 120,
          }
        : undefined,
      totalEstimatedPriceUSD: baseTotal,
      packageDiscountPercent: 15,
      finalPriceUSD: Math.round(baseTotal * 0.85),
      summaryHighlights: isEs
        ? ['Colas de langosta a la parrilla y champán helado', 'Piscina natural con estrellas de mar', 'Atención VIP 100% personalizada']
        : ['Fresh grilled lobster tails & chilled champagne', 'Waist-deep natural pool with starfish', '100% personalized VIP service'],
    };
  }

  if (party === 'family' || vibe === 'jungle_thrill') {
    const baseTotal = 170 + (transport ? 90 : 0);
    return {
      title: isEs ? 'Combo Épico Familiar: Monos & Buggies' : 'Epic Family Combo: Monkeys & Mud Buggies',
      subtitle: isEs ? 'Aventura llena de acción, cenotes y sonrisas sin pantallas' : 'Action-packed jungle adventure, cenote swim, and screen-free fun',
      themeVariant: 'jungle_green',
      primaryTour: {
        name: isEs ? 'Monkeyland: Encuentro con Monos Ardilla' : 'Monkeyland: Meet the Squirrel Monkeys',
        description: isEs ? 'Interactúa con amigables monitos en la montaña de Anamuya.' : 'Interact with adorable squirrel monkeys in Anamuya mountain sanctuary.',
        image: 'https://cdn.pixabay.com/photo/2019/06/11/18/56/quad-4268938_1280.jpg',
        estimatedPriceUSD: 85,
      },
      secondaryTour: {
        name: isEs ? 'Buggies Todoterreno & Cenote Cueva Macao' : 'Off-Road Buggy & Macao Cenote Cave',
        description: isEs ? 'Maneja por senderos de barro, nada en cueva subterránea y visita Playa Macao.' : 'Drive muddy jungle trails, swim in underground cave, and hit Macao Beach.',
        image: 'https://cdn.pixabay.com/photo/2016/03/27/19/31/adventure-1286920_1280.jpg',
        estimatedPriceUSD: 85,
      },
      transportService: transport
        ? {
            name: isEs ? 'Van Familiar Privada con Aire Acondicionado' : 'Private Air-Conditioned Family Van',
            description: isEs ? 'Traslado cómodo para toda la familia con recogida puntual.' : 'Comfortable private van pickup for the entire family.',
            estimatedPriceUSD: 90,
          }
        : undefined,
      totalEstimatedPriceUSD: baseTotal,
      packageDiscountPercent: 12,
      finalPriceUSD: Math.round(baseTotal * 0.88),
      summaryHighlights: isEs
        ? ['Interacción guiada con monos ardilla rescatados', 'Ruta 4x4 en barro y baño en cenote', 'Parada en la famosa Playa Macao']
        : ['Guided interaction with rescued squirrel monkeys', '4x4 muddy trail drive & cenote swim', 'Stop at world-famous Macao Beach'],
    };
  }

  if (party === 'friends' || vibe === 'party_nightlife') {
    const baseTotal = 150 + (transport ? 80 : 0);
    return {
      title: isEs ? 'Fiesta Caribeña: Catamarán & Noche en Coco Bongo' : 'Caribbean Fiesta: Party Boat & Coco Bongo',
      subtitle: isEs ? 'Música en vivo, piscina natural al atardecer y la mejor discoteca del mundo' : 'Live DJ, sunset natural pool, and the world-famous show club',
      themeVariant: 'sunset_gold',
      primaryTour: {
        name: isEs ? 'Party Boat en Bávaro & Barra Flotante' : 'Bávaro Party Boat & Floating Bar',
        description: isEs ? 'Música, snorkel en arrecifes y tragos en la Piscina Natural.' : 'Music, reef snorkeling, and floating drinks in the Natural Pool.',
        image: 'https://cdn.pixabay.com/photo/2016/11/22/19/18/boat-1850214_1280.jpg',
        estimatedPriceUSD: 65,
      },
      secondaryTour: {
        name: isEs ? 'Coco Bongo Punta Cana Show & Party' : 'Coco Bongo Punta Cana Show & Party',
        description: isEs ? 'Espectáculo de acrobacias, tributos en vivo y fiesta ilimitada.' : 'World-class acrobatics, live tributes, and endless entertainment.',
        image: 'https://cdn.pixabay.com/photo/2016/11/21/15/46/beach-1846035_1280.jpg',
        estimatedPriceUSD: 85,
      },
      transportService: transport
        ? {
            name: isEs ? 'Shuttle Privado de Fiesta Ida y Vuelta' : 'Private Roundtrip Party Shuttle',
            description: isEs ? 'Transporte privado para el grupo sin preocupaciones de manejo.' : 'Hassle-free private group van to and from venue.',
            estimatedPriceUSD: 80,
          }
        : undefined,
      totalEstimatedPriceUSD: baseTotal,
      packageDiscountPercent: 10,
      finalPriceUSD: Math.round(baseTotal * 0.9),
      summaryHighlights: isEs
        ? ['Barra libre y DJ en catamarán', 'Fiesta en Piscina Natural con agua a la cintura', 'Entradas garantizadas para Coco Bongo']
        : ['Open bar & live DJ on catamaran', 'Waist-deep Natural Pool party', 'Guaranteed Coco Bongo tickets'],
    };
  }

  // Default Solo or Couple Water Chill Recommendation
  const baseTotal = 165 + (transport ? 70 : 0);
  return {
    title: isEs ? 'Escape Paradisíaco: Isla Saona & Lancha Rápida' : 'Paradise Escape: Saona Island & Speedboat',
    subtitle: isEs ? 'Aguas turquesas, brisa marina, piscina natural y relajación total' : 'Turquoise waters, ocean breeze, natural pool, and total relaxation',
    themeVariant: 'ocean_blue',
    primaryTour: {
      name: isEs ? 'Isla Saona: El Paraíso Caribeño' : 'Saona Island: Paradise Found',
      description: isEs ? 'Día de playa en arena blanca, catamarán, buffet dominicano y estanque natural.' : 'White-sand beach day, catamaran sail, Dominican buffet, and starfish pool.',
      image: 'https://cdn.pixabay.com/photo/2016/11/19/14/00/beach-1836467_1280.jpg',
      estimatedPriceUSD: 100,
    },
    secondaryTour: {
      name: isEs ? 'Lancha Rápida & Snorkel en Arrecifes' : 'Speedboat Drive & Reef Snorkel',
      description: isEs ? 'Capitanea tu propia lancha y explora arrecifes de corales.' : 'Captain your own speed boat and dive over vibrant coral reefs.',
      image: 'https://cdn.pixabay.com/photo/2016/11/22/19/18/boat-1850214_1280.jpg',
      estimatedPriceUSD: 65,
    },
    transportService: transport
      ? {
          name: isEs ? 'Auto Privado con Chofer (Bávaro / Bayahíbe)' : 'Private Car & Driver (Bávaro / Bayahíbe)',
          description: isEs ? 'Vehículo privado con chofer a tu disposición.' : 'Dedicated car and driver at your service.',
          estimatedPriceUSD: 70,
        }
      : undefined,
    totalEstimatedPriceUSD: baseTotal,
    packageDiscountPercent: 10,
    finalPriceUSD: Math.round(baseTotal * 0.9),
    summaryHighlights: isEs
      ? ['Paseo en catamarán con música y bebidas', 'Piscina natural waist-deep con estrellas de mar', 'Conducción libre de lancha rápida']
      : ['Catamaran sail with music & drinks', 'Starfish natural pool stop', 'Drive your own speedboat along coast'],
  };
}
