import { useState } from 'react';
import { inputClassName } from './shared';

export interface PredefinedCategory {
  id: string;
  name: string;
  group: string;
  templateSlug: 'modern-business' | 'food-bakery' | 'salon-studio' | 'jewellery-boutique';
  descriptionPlaceholder: string;
  badge?: string;
}

export interface CategoryGroup {
  name: string;
  emoji: string;
  categories: PredefinedCategory[];
}

export const PREDEFINED_CATEGORIES: PredefinedCategory[] = [
  // Healthcare & Clinics
  {
    id: 'clinic-doctor',
    name: 'Clinic / Doctor',
    group: 'Healthcare & Clinics',
    templateSlug: 'modern-business',
    descriptionPlaceholder: 'Dedicated outpatient clinic offering expert medical consultations, health diagnostics, and compassionate patient care.',
    badge: 'Popular',
  },
  {
    id: 'dental-clinic',
    name: 'Dental Clinic',
    group: 'Healthcare & Clinics',
    templateSlug: 'modern-business',
    descriptionPlaceholder: 'Modern dental practice providing advanced dental care, smile designing, root canal treatments, and preventative oral health.',
  },
  {
    id: 'ayurveda-homeopathy',
    name: 'Ayurveda & Homeopathy Clinic',
    group: 'Healthcare & Clinics',
    templateSlug: 'modern-business',
    descriptionPlaceholder: 'Holistic wellness clinic specializing in classical Ayurvedic therapies, herbal medicine, and natural root-cause healing.',
  },
  {
    id: 'physiotherapy-wellness',
    name: 'Physiotherapy & Rehabilitation',
    group: 'Healthcare & Clinics',
    templateSlug: 'modern-business',
    descriptionPlaceholder: 'Professional physiotherapy clinic offering sports injury rehab, posture correction, pain management, and mobility care.',
  },

  // Astrology & Spiritual
  {
    id: 'astrology-horoscope',
    name: 'Astrology & Horoscope',
    group: 'Astrology & Spiritual',
    templateSlug: 'modern-business',
    descriptionPlaceholder: 'Vedic astrology centre offering detailed Kundli analysis, career forecasts, relationship matchmaking, and life guidance.',
    badge: 'Popular',
  },
  {
    id: 'vastu-consultation',
    name: 'Vastu Consultation',
    group: 'Astrology & Spiritual',
    templateSlug: 'modern-business',
    descriptionPlaceholder: 'Expert Vastu Shastra consultation for homes, commercial offices, and industrial setups without structural demolition.',
  },
  {
    id: 'tarot-numerology',
    name: 'Tarot & Numerology',
    group: 'Astrology & Spiritual',
    templateSlug: 'modern-business',
    descriptionPlaceholder: 'Intuitive tarot readings, spiritual energy counseling, and name numerology analysis for clarity and peace of mind.',
  },

  // Tours & Travel
  {
    id: 'tour-and-travels',
    name: 'Tour and Travels',
    group: 'Tours & Travel',
    templateSlug: 'modern-business',
    descriptionPlaceholder: 'Trusted travel agency offering curated domestic and international holiday packages, flight bookings, and local sightseeing.',
    badge: 'Popular',
  },
  {
    id: 'travel-agency',
    name: 'Travel Agency & Holiday Packages',
    group: 'Tours & Travel',
    templateSlug: 'modern-business',
    descriptionPlaceholder: 'Complete holiday planning, customized family itineraries, honeymoon packages, and visa assistance.',
  },
  {
    id: 'taxi-cab-rental',
    name: 'Taxi & Car Rental Services',
    group: 'Tours & Travel',
    templateSlug: 'modern-business',
    descriptionPlaceholder: 'Reliable outstation cab booking, airport transfers, luxury car rentals, and round-the-clock chauffeur services.',
  },
  {
    id: 'hotel-resort-stay',
    name: 'Hotel, Resort & Homestay',
    group: 'Tours & Travel',
    templateSlug: 'modern-business',
    descriptionPlaceholder: 'Scenic getaway retreat and boutique accommodations with premium hospitality, dining, and scenic surroundings.',
  },

  // Food & Dining
  {
    id: 'bakery-pastry',
    name: 'Bakery & Pastry Shop',
    group: 'Food & Dining',
    templateSlug: 'food-bakery',
    descriptionPlaceholder: 'Artisanal bakery crafting fresh sourdoughs, handcrafted pastries, celebration cakes, and daily oven-fresh bakes.',
    badge: 'Popular',
  },
  {
    id: 'restaurant-fine-dining',
    name: 'Restaurant & Cafe',
    group: 'Food & Dining',
    templateSlug: 'food-bakery',
    descriptionPlaceholder: 'Warm dining destination celebrating authentic flavours, seasonal recipes, signature beverages, and family gatherings.',
    badge: 'Popular',
  },
  {
    id: 'cloud-kitchen-catering',
    name: 'Cloud Kitchen & Catering',
    group: 'Food & Dining',
    templateSlug: 'food-bakery',
    descriptionPlaceholder: 'Gourmet meal deliveries, corporate catering, and bespoke party menus prepared with premium fresh ingredients.',
  },
  {
    id: 'sweets-confectionery',
    name: 'Sweets & Confectionery',
    group: 'Food & Dining',
    templateSlug: 'food-bakery',
    descriptionPlaceholder: 'Traditional heritage sweets, pure ghee delicacies, namkeen, and festive gift boxes made with authentic recipes.',
  },

  // Beauty & Wellness
  {
    id: 'salon-beauty-parlour',
    name: 'Salon & Beauty Parlour',
    group: 'Beauty & Personal Care',
    templateSlug: 'salon-studio',
    descriptionPlaceholder: 'Full-service luxury beauty salon offering precision haircuts, hair spa, skin rituals, and premium makeovers.',
    badge: 'Popular',
  },
  {
    id: 'spa-wellness-studio',
    name: 'Spa & Wellness Studio',
    group: 'Beauty & Personal Care',
    templateSlug: 'salon-studio',
    descriptionPlaceholder: 'Tranquil wellness haven specializing in therapeutic body massages, detox facials, aromatherapy, and relaxation rituals.',
  },
  {
    id: 'makeup-bridal-studio',
    name: 'Bridal Makeup & Nail Studio',
    group: 'Beauty & Personal Care',
    templateSlug: 'salon-studio',
    descriptionPlaceholder: 'High-end bridal makeup atelier and bespoke nail art studio crafting timeless looks for weddings and celebrations.',
  },
  {
    id: 'mens-grooming-barber',
    name: "Barber Shop & Men's Grooming",
    group: 'Beauty & Personal Care',
    templateSlug: 'salon-studio',
    descriptionPlaceholder: "Contemporary men's salon providing modern fades, beard styling, hot towel treatments, and revitalizing face care.",
  },

  // Jewellery & Luxury
  {
    id: 'jewellery-boutique',
    name: 'Jewellery Boutique',
    group: 'Jewellery & Luxury',
    templateSlug: 'jewellery-boutique',
    descriptionPlaceholder: 'Curated showroom of hallmarked fine jewellery, polki heirlooms, gold ornaments, and bespoke custom designs.',
    badge: 'Popular',
  },
  {
    id: 'diamond-gemstones',
    name: 'Diamond & Gemstone Atelier',
    group: 'Jewellery & Luxury',
    templateSlug: 'jewellery-boutique',
    descriptionPlaceholder: 'Certified certified natural diamond jewellery, precious colored gemstones, and engagement ring atelier.',
  },
  {
    id: 'designer-fashion-boutique',
    name: 'Designer Fashion & Apparel',
    group: 'Jewellery & Luxury',
    templateSlug: 'jewellery-boutique',
    descriptionPlaceholder: 'Haute couture studio showcasing handcrafted festive wear, bridal lehengas, and contemporary bespoke silhouettes.',
  },

  // Professional & Advisory
  {
    id: 'business-consulting',
    name: 'Business Consulting & Advisory',
    group: 'Professional Services',
    templateSlug: 'modern-business',
    descriptionPlaceholder: 'Strategic business advisory firm driving operational excellence, digital transformation, and sustainable growth.',
  },
  {
    id: 'ca-tax-accounting',
    name: 'CA, Tax & Financial Advisory',
    group: 'Professional Services',
    templateSlug: 'modern-business',
    descriptionPlaceholder: 'Chartered accountancy firm offering corporate tax planning, GST filing, auditing, and financial consulting.',
  },
  {
    id: 'legal-firm-advocate',
    name: 'Legal Firm & Advocate',
    group: 'Professional Services',
    templateSlug: 'modern-business',
    descriptionPlaceholder: 'Experienced legal practice providing corporate counsel, property law advice, contract drafting, and dispute resolution.',
  },
  {
    id: 'real-estate-property',
    name: 'Real Estate & Property Advisory',
    group: 'Professional Services',
    templateSlug: 'modern-business',
    descriptionPlaceholder: 'Premier real estate consultancy offering verified residential properties, commercial investments, and land advisory.',
  },
  {
    id: 'architecture-interior',
    name: 'Architecture & Interior Design',
    group: 'Professional Services',
    templateSlug: 'modern-business',
    descriptionPlaceholder: 'Architectural studio crafting inspiring residential interiors, modern commercial spaces, and turnkey styling.',
  },

  // Education & Fitness
  {
    id: 'coaching-education',
    name: 'Coaching & Education Institute',
    group: 'Education & Fitness',
    templateSlug: 'modern-business',
    descriptionPlaceholder: 'Premier learning academy offering personalized academic coaching, competitive exam prep, and skill development.',
  },
  {
    id: 'fitness-gym',
    name: 'Fitness Gym & Training Centre',
    group: 'Education & Fitness',
    templateSlug: 'modern-business',
    descriptionPlaceholder: 'High-energy fitness center equipped with advanced strength equipment, personal training, and functional workout zones.',
  },
  {
    id: 'yoga-meditation',
    name: 'Yoga & Meditation Centre',
    group: 'Education & Fitness',
    templateSlug: 'salon-studio',
    descriptionPlaceholder: 'Authentic yoga sanctuary offering traditional hatha yoga classes, breathwork, sound healing, and meditation workshops.',
  },
];

export const CATEGORY_GROUPS: CategoryGroup[] = (() => {
  const map = new Map<string, PredefinedCategory[]>();
  for (const cat of PREDEFINED_CATEGORIES) {
    const list = map.get(cat.group) || [];
    list.push(cat);
    map.set(cat.group, list);
  }

  const groupEmojis: Record<string, string> = {
    'Healthcare & Clinics': '🏥',
    'Astrology & Spiritual': '🔮',
    'Tours & Travel': '✈️',
    'Food & Dining': '🍽️',
    'Beauty & Personal Care': '✨',
    'Jewellery & Luxury': '💎',
    'Professional Services': '💼',
    'Education & Fitness': '🎓',
  };

  return Array.from(map.entries()).map(([name, categories]) => ({
    name,
    emoji: groupEmojis[name] || '📁',
    categories,
  }));
})();

export const POPULAR_CATEGORY_NAMES = [
  'Clinic / Doctor',
  'Astrology & Horoscope',
  'Tour and Travels',
  'Bakery & Pastry Shop',
  'Salon & Beauty Parlour',
  'Jewellery Boutique',
  'Restaurant & Cafe',
];

export function findPredefinedCategory(nameOrId?: string | null): PredefinedCategory | undefined {
  if (!nameOrId) return undefined;
  const normalized = nameOrId.trim().toLowerCase();
  return PREDEFINED_CATEGORIES.find(
    (c) => c.id.toLowerCase() === normalized || c.name.toLowerCase() === normalized
  );
}

export function CategorySelectField({
  label = 'Category',
  value,
  onChange,
  onTemplateSuggest,
  required = false,
  descriptionFieldProps,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  onTemplateSuggest?: (templateSlug: string) => void;
  required?: boolean;
  descriptionFieldProps?: {
    currentDescription?: string;
    onDescriptionSuggest?: (description: string) => void;
  };
}) {
  const isPredefined = PREDEFINED_CATEGORIES.some(
    (c) => c.name.toLowerCase() === (value || '').trim().toLowerCase()
  );
  const [isCustomMode, setIsCustomMode] = useState(!isPredefined && Boolean(value));

  const handleSelect = (categoryName: string) => {
    if (categoryName === '__CUSTOM__') {
      setIsCustomMode(true);
      return;
    }

    setIsCustomMode(false);
    onChange(categoryName);

    const found = findPredefinedCategory(categoryName);
    if (found) {
      if (onTemplateSuggest) {
        onTemplateSuggest(found.templateSlug);
      }
      if (
        descriptionFieldProps?.onDescriptionSuggest &&
        !descriptionFieldProps.currentDescription &&
        found.descriptionPlaceholder
      ) {
        descriptionFieldProps.onDescriptionSuggest(found.descriptionPlaceholder);
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-[#33463d]">
          {label} {required ? <span className="text-[#a04a2b]">*</span> : null}
        </label>
        <button
          type="button"
          onClick={() => {
            const nextMode = !isCustomMode;
            setIsCustomMode(nextMode);
            if (!nextMode && !isPredefined) {
              handleSelect(PREDEFINED_CATEGORIES[0].name);
            }
          }}
          className="text-xs font-semibold text-[#0E2B22] underline decoration-[#c6b676] underline-offset-2 hover:text-[#8D7026]"
        >
          {isCustomMode ? 'Choose from predefined categories' : 'Type custom category'}
        </button>
      </div>

      {/* Quick selection pill chips */}
      <div className="flex flex-wrap gap-1.5 pb-1">
        {POPULAR_CATEGORY_NAMES.map((catName) => {
          const isSelected = value?.trim().toLowerCase() === catName.toLowerCase();
          return (
            <button
              key={catName}
              type="button"
              onClick={() => handleSelect(catName)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                isSelected
                  ? 'bg-[#0E2B22] text-white shadow-sm ring-2 ring-[#0E2B22]/20'
                  : 'border border-[#d9d4c7] bg-white text-[#45574c] hover:border-[#0E2B22] hover:bg-[#f3f7f4]'
              }`}
            >
              {catName}
            </button>
          );
        })}
      </div>

      {!isCustomMode ? (
        <select
          className={inputClassName}
          value={isPredefined ? value : '__CUSTOM__'}
          onChange={(e) => handleSelect(e.target.value)}
          required={required}
        >
          <option value="" disabled>
            -- Select a business category --
          </option>
          {CATEGORY_GROUPS.map((group) => (
            <optgroup key={group.name} label={`${group.emoji} ${group.name}`}>
              {group.categories.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </optgroup>
          ))}
          <option value="__CUSTOM__">✍️ Other / Custom Category (type manually)</option>
        </select>
      ) : (
        <div className="relative">
          <input
            className={inputClassName}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. Clinic, Astrology, Tour & Travels, Pet Care"
            required={required}
            maxLength={120}
            autoFocus
          />
          <span className="mt-1 block text-xs text-[#68746c]">
            Custom category entered. Click &ldquo;Choose from predefined categories&rdquo; to switch back.
          </span>
        </div>
      )}
    </div>
  );
}
