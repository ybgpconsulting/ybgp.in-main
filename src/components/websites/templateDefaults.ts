import type { WebsiteTemplateDesign } from './templateDesigns';

export interface WebsiteTheme {
  pageBg: string;
  panel: string;
  panelStrong: string;
  headerSurface: string;
  text: string;
  muted: string;
  accent: string;
  accentSoft: string;
  accentDark: string;
  accentStrong: string;
  border: string;
  label: string;
  heroOverlay: string;
  cta: string;
}

export const demoThemes: Record<'modern' | 'bakery' | 'salon' | 'jewellery' | 'food', WebsiteTheme> = {
  modern: {
    pageBg: '#f4f7f4',
    panel: '#ffffff',
    panelStrong: '#e7eee8',
    headerSurface: 'rgba(255,255,255,0.82)',
    text: '#192c23',
    muted: '#52685b',
    accent: '#799783',
    accentSoft: '#e4eee6',
    accentDark: '#183629',
    accentStrong: '#294a38',
    border: '#dce6de',
    label: '#587464',
    heroOverlay: 'linear-gradient(90deg, rgba(22,44,34,0.76), rgba(22,44,34,0.12))',
    cta: '#183629',
  },
  bakery: {
    pageBg: '#f9f1ea',
    panel: '#fffaf6',
    panelStrong: '#f4e4d5',
    headerSurface: 'rgba(255,255,255,0.78)',
    text: '#1d120d',
    muted: '#6b4b3b',
    accent: '#b15f42',
    accentSoft: '#f8e4d9',
    accentDark: '#40251a',
    accentStrong: '#a04a2b',
    border: '#eddfd2',
    label: '#a8643d',
    heroOverlay: 'linear-gradient(90deg, rgba(22,12,8,0.72), rgba(38,24,17,0.2))',
    cta: '#b15f42',
  },
  food: {
    pageBg: '#f9f1ea',
    panel: '#fffaf6',
    panelStrong: '#f4e4d5',
    headerSurface: 'rgba(255,255,255,0.78)',
    text: '#1d120d',
    muted: '#6b4b3b',
    accent: '#b15f42',
    accentSoft: '#f8e4d9',
    accentDark: '#40251a',
    accentStrong: '#a04a2b',
    border: '#eddfd2',
    label: '#a8643d',
    heroOverlay: 'linear-gradient(90deg, rgba(22,12,8,0.72), rgba(38,24,17,0.2))',
    cta: '#b15f42',
  },
  salon: {
    pageBg: '#f7f3ef',
    panel: '#fffdfb',
    panelStrong: '#f0e5df',
    headerSurface: 'rgba(255,255,255,0.72)',
    text: '#201a17',
    muted: '#6e5651',
    accent: '#b98474',
    accentSoft: '#f3e4df',
    accentDark: '#3c2e2b',
    accentStrong: '#8f5c54',
    border: '#eadfd9',
    label: '#8c5d55',
    heroOverlay: 'linear-gradient(90deg, rgba(33,23,20,0.72), rgba(33,23,20,0.12))',
    cta: '#8f5c54',
  },
  jewellery: {
    pageBg: '#f5f2ee',
    panel: '#fdfbf9',
    panelStrong: '#efe5dc',
    headerSurface: 'rgba(255,255,255,0.74)',
    text: '#1b1715',
    muted: '#625b57',
    accent: '#9d7655',
    accentSoft: '#efe5d9',
    accentDark: '#1a1818',
    accentStrong: '#876444',
    border: '#e7e0da',
    label: '#8d6a4d',
    heroOverlay: 'linear-gradient(90deg, rgba(13,13,13,0.68), rgba(13,13,13,0.22))',
    cta: '#8d6a4d',
  },
};

export type DemoHighlight = {
  title: string;
  subtitle: string;
  image: string;
  alt: string;
};

export type DemoProduct = {
  name: string;
  image: string;
  alt: string;
  description: string;
  price?: string;
};

export type DemoBusiness = {
  slug: string;
  template: 'modern' | 'bakery' | 'salon' | 'jewellery';
  templateName: string;
  name: string;
  category: string;
  seoTitle: string;
  summary: string;
  location: { label: string; query: string };
  openingHours: string;
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    primaryCta: string;
    image: string;
    alt: string;
  };
  highlights: DemoHighlight[];
  story: {
    eyebrow: string;
    title: string;
    description: string;
    image: string;
    alt: string;
    points: string[];
    cta: string;
  };
  bestsellers: DemoProduct[];
  gallery: { image: string; alt: string }[];
  finalCta: { title: string; description: string; button: string };
};

export const demoBusinesses: Record<string, DemoBusiness> = {
  'demo-modern': {
    slug: 'demo-modern',
    template: 'modern',
    templateName: 'Modern Business',
    name: 'Northline Studio',
    category: 'Business strategy & digital consulting',
    seoTitle: 'Northline Studio | Business Strategy & Consulting Demo',
    summary: 'An independent consulting studio helping businesses find clarity, improve digital presence, and grow with confidence.',
    location: { label: 'Noida, Uttar Pradesh, India · By appointment', query: 'Noida, Uttar Pradesh, India' },
    openingHours: 'Monday – Friday · 9:30 AM – 6:00 PM · By appointment',
    hero: {
      eyebrow: 'Independent consulting studio',
      title: 'Make your next business move with confidence.',
      description: 'Northline Studio brings strategy, thoughtful design, and practical digital support together for ambitious businesses.',
      primaryCta: 'Start a conversation',
      image: '/demo-sites/modern/workspace.jpg',
      alt: 'A bright, contemporary studio meeting space',
    },
    highlights: [
      { title: 'Business strategy', subtitle: 'Turn big ambitions into practical plans, clear priorities, and measurable next steps.', image: '/demo-sites/modern/meeting.jpg', alt: 'A collaborative team discussion around a work table' },
      { title: 'Digital experiences', subtitle: 'Make your services easier to understand, trust, and find online.', image: '/demo-sites/modern/workspace.jpg', alt: 'A calm and light-filled modern workspace' },
      { title: 'Brand foundations', subtitle: 'Create a consistent identity and message that feels unmistakably yours.', image: '/demo-sites/modern/studio.jpg', alt: 'A considered contemporary studio interior' },
      { title: 'Growth support', subtitle: 'Get a trusted partner to help you make progress as your business evolves.', image: '/demo-sites/modern/team.jpg', alt: 'A small team sharing ideas during a planning session' },
    ],
    story: {
      eyebrow: 'About our studio',
      title: 'Good advice starts by understanding your business.',
      description: 'We work alongside founders and teams to understand what is holding them back, decide what matters next, and shape a clear plan they can put into action with confidence.',
      image: '/demo-sites/modern/team.jpg',
      alt: 'A small team working together in a bright studio',
      points: ['Straightforward, founder-friendly advice', 'A clear plan with practical next steps', 'Collaborative support from idea to launch'],
      cta: 'How we work',
    },
    bestsellers: [
      { name: 'Business Clarity Session', image: '/demo-sites/modern/meeting.jpg', alt: 'A strategy conversation between business partners', description: 'A focused session to clarify your priorities and agree on useful next steps.', price: 'From ₹4,500' },
      { name: 'Digital Presence Review', image: '/demo-sites/modern/workspace.jpg', alt: 'A clean workspace prepared for a digital business review', description: 'A practical review of your website, messaging, and customer journey.', price: 'From ₹7,500' },
      { name: 'Ongoing Growth Partner', image: '/demo-sites/modern/studio.jpg', alt: 'A quiet, contemporary setting for focused consulting work', description: 'Regular strategic support shaped around your team and business goals.', price: 'By consultation' },
    ],
    gallery: [
      { image: '/demo-sites/modern/workspace.jpg', alt: 'A bright studio ready for a planning session' },
      { image: '/demo-sites/modern/meeting.jpg', alt: 'Colleagues exchanging ideas around a table' },
      { image: '/demo-sites/modern/team.jpg', alt: 'A team collaborating on a shared project' },
      { image: '/demo-sites/modern/studio.jpg', alt: 'A refined, modern consulting studio' },
    ],
    finalCta: {
      title: 'Ready to make your next move?',
      description: 'Tell us where you want to go. We will help you find a clear, practical way to get there.',
      button: 'Talk to our team',
    },
  },
  'demo-bakery': {
    slug: 'demo-bakery',
    template: 'bakery',
    templateName: 'The Bakehouse',
    name: 'Aroma & Crumb',
    category: 'Bakery & gifting studio',
    seoTitle: 'Aroma & Crumb | Artisan Bakery Demo',
    summary: 'Custom cakes, handcrafted desserts and thoughtful gifting for every celebration.',
    location: { label: 'Bandra West, Mumbai, Maharashtra · Sample location', query: 'Bandra West, Mumbai, Maharashtra' },
    openingHours: 'Tuesday – Sunday · 9:00 AM – 8:00 PM',
    hero: {
      eyebrow: 'Artisan Bakery & Gifting',
      title: 'Freshly baked moments, made to be remembered.',
      description: 'Custom cakes, handcrafted desserts and thoughtful gifting for every celebration.',
      primaryCta: 'Order on WhatsApp',
      image: '/demo-sites/bakery/hero.jpg',
      alt: 'A celebration cake with fresh berries and a warm bakery backdrop',
    },
    highlights: [
      { title: 'Celebration Cakes', subtitle: 'Bespoke layers and thoughtful finishes for birthdays and milestones.', image: '/demo-sites/bakery/collection-1.jpg', alt: 'Slices of rich chocolate cake ready to share' },
      { title: 'Brownies & Desserts', subtitle: 'Small-batch treats, made for passing around the table.', image: '/demo-sites/bakery/collection-2.jpg', alt: 'Freshly baked brownies with a glossy chocolate finish' },
      { title: 'Gift Hampers', subtitle: 'A considered mix of sweet things for hosts and celebrations.', image: '/demo-sites/bakery/collection-3.jpg', alt: 'A small batch of handmade bakery sweets arranged for sharing' },
      { title: 'Custom Cakes', subtitle: 'Flavours and finishes shaped around your celebration.', image: '/demo-sites/bakery/collection-4.jpg', alt: 'A decorated cake ready for a special occasion' },
    ],
    story: {
      eyebrow: 'Our story',
      title: 'Baked for everyday rituals and unforgettable celebrations.',
      description: 'Every order starts with a simple idea: beautifully made treats that make gatherings feel warmer, more thoughtful and more personal. We bake in small batches and mix in premium seasonal ingredients.',
      image: '/demo-sites/bakery/story.jpg',
      alt: 'A baker shaping fresh dough at a flour-dusted worktable',
      points: ['Small-batch artisan baking', 'Custom celebration cakes', 'Thoughtful gifting and event styling'],
      cta: 'Plan your celebration',
    },
    bestsellers: [
      { name: 'Cocoa Velvet Cake', image: '/demo-sites/bakery/bestseller-1.jpg', alt: 'A chocolate layer cake finished with smooth ganache', description: 'Dark chocolate layers with a silky ganache finish.', price: '₹2,199' },
      { name: 'Berry Celebration Slice', image: '/demo-sites/bakery/bestseller-2.jpg', alt: 'A berry-topped cake slice served with fresh fruit', description: 'Soft sponge, bright berries and a delicate cream finish.', price: '₹499' },
      { name: 'Brown Butter Cupcake', image: '/demo-sites/bakery/bestseller-3.jpg', alt: 'A small chocolate cupcake topped with buttercream', description: 'A tender crumb, rich cocoa and a swirl of house-made frosting.', price: '₹220' },
    ],
    gallery: [
      { image: '/demo-sites/bakery/gallery-1.jpg', alt: 'A bright celebration cake layered with fresh orange and cream' },
      { image: '/demo-sites/bakery/gallery-2.jpg', alt: 'Freshly baked pastries displayed together on a bakery tray' },
      { image: '/demo-sites/bakery/gallery-3.jpg', alt: 'A wholegrain loaf dusted with flour before baking' },
      { image: '/demo-sites/bakery/gallery-4.jpg', alt: 'A bakery gift box packed with assorted fruit-topped pastries' },
      { image: '/demo-sites/bakery/gallery-5.jpg', alt: 'A layered chocolate cake slice plated for serving' },
      { image: '/demo-sites/bakery/gallery-6.jpg', alt: 'A bakery counter filled with fresh loaves and pastries' },
    ],
    finalCta: {
      title: 'Planning something sweet?',
      description: 'Tell us the occasion and we will help shape a cake, hamper or dessert table that feels just right.',
      button: 'WhatsApp us',
    },
  },
  'demo-salon': {
    slug: 'demo-salon',
    template: 'salon',
    templateName: 'The Beauty Studio',
    name: 'Maison Gloss',
    category: 'Salon & wellness studio',
    seoTitle: 'Maison Gloss | Salon & Wellness Demo',
    summary: 'Thoughtful beauty experiences designed around your style, confidence and wellbeing.',
    location: { label: 'Koregaon Park, Pune, Maharashtra · Sample location', query: 'Koregaon Park, Pune, Maharashtra' },
    openingHours: 'Tuesday – Sunday · 10:00 AM – 7:00 PM · By appointment',
    hero: {
      eyebrow: 'Salon & Wellness Studio',
      title: 'Beauty, refined.',
      description: 'Thoughtful beauty experiences designed around your style, confidence and wellbeing.',
      primaryCta: 'Book Appointment',
      image: '/demo-sites/salon/hero.jpg',
      alt: 'A refined salon interior with styling chairs and mirrors',
    },
    highlights: [
      { title: 'The Signature Cut', subtitle: 'Shape, movement and an easy finish tailored to your hair.', image: '/demo-sites/salon/service-1.jpg', alt: 'A stylist sectioning a client’s hair for a precision cut' },
      { title: 'Colour Atelier', subtitle: 'Natural-looking dimension with a considered gloss and tone.', image: '/demo-sites/salon/service-2.jpg', alt: 'A stylist curling a client’s hair into soft, polished waves' },
      { title: 'Skin Rituals', subtitle: 'Restorative facials and a little space to switch off.', image: '/demo-sites/salon/service-3.jpg', alt: 'A beauty therapist applying a restorative facial treatment' },
      { title: 'Bridal Beauty', subtitle: 'A thoughtful trial and a look that still feels like you.', image: '/demo-sites/salon/service-4.jpg', alt: 'A curated palette of cosmetics for a bridal beauty look' },
    ],
    story: {
      eyebrow: 'About our studio',
      title: 'A refined beauty ritual, designed around you.',
      description: 'We blend technique, calm and personal care to create a salon experience that feels elevated yet effortless. Every service is customised to your routine and features.',
      image: '/demo-sites/salon/story.jpg',
      alt: 'A stylist shampooing a client’s hair at the salon basin',
      points: ['Luxury hair and beauty care', 'Personalised salon rituals', 'Wellness-first finishing'],
      cta: 'Find your appointment',
    },
    bestsellers: [
      { name: 'The Maison Blowout', image: '/demo-sites/salon/bestseller-1.jpg', alt: 'A stylist blow-drying a client’s hair into soft waves', description: 'Soft volume and a polished finish with lasting movement.', price: '₹2,800' },
      { name: 'The Glow Facial', image: '/demo-sites/salon/bestseller-2.jpg', alt: 'A client enjoying a gentle facial massage', description: 'A restorative facial focused on comfort, hydration and glow.', price: '₹3,600' },
      { name: 'The Bridal Edit', image: '/demo-sites/salon/bestseller-3.jpg', alt: 'Softly styled hair and natural makeup for a special occasion', description: 'A personal trial to find the right tones, texture and finish.', price: 'By consultation' },
    ],
    gallery: [
      { image: '/demo-sites/salon/gallery-1.jpg', alt: 'A view across the salon’s mirrors and styling chairs' },
      { image: '/demo-sites/salon/gallery-2.jpg', alt: 'Professional styling tools laid out between appointments' },
      { image: '/demo-sites/salon/gallery-3.jpg', alt: 'A stylist refining a client’s haircut with scissors' },
      { image: '/demo-sites/salon/gallery-4.jpg', alt: 'A close-up of a stylist shaping a client’s hair' },
      { image: '/demo-sites/salon/gallery-5.jpg', alt: 'A calming aromatherapy treatment with warm massage oil' },
      { image: '/demo-sites/salon/gallery-6.jpg', alt: 'A detailed manicure finished with polish' },
    ],
    finalCta: {
      title: 'Your next appointment starts here.',
      description: 'Reserve a consultation and let us shape a beauty ritual that suits your day-to-day life and special occasions.',
      button: 'Book a slot',
    },
  },
  'demo-jewellery': {
    slug: 'demo-jewellery',
    template: 'jewellery',
    templateName: 'The Editorial Boutique',
    name: 'Silver Elara',
    category: 'Jewellery boutique',
    seoTitle: 'Silver Elara | Jewellery Boutique Demo',
    summary: 'Timeless pieces crafted for celebrations, milestones and everyday elegance.',
    location: { label: 'C-Scheme, Jaipur, Rajasthan · Sample location', query: 'C-Scheme, Jaipur, Rajasthan' },
    openingHours: 'Monday – Saturday · 11:00 AM – 8:00 PM',
    hero: {
      eyebrow: 'Fine Jewellery & Gifting',
      title: 'Details worth remembering.',
      description: 'Timeless pieces crafted for celebrations, milestones and everyday elegance.',
      primaryCta: 'Explore Collection',
      image: '/demo-sites/jewellery/hero.jpg',
      alt: 'Sculptural gold jewellery arranged on pale stone in dramatic light',
    },
    highlights: [
      { title: 'Necklaces', subtitle: 'Sculptural pendants and fine chains for everyday layering.', image: '/demo-sites/jewellery/collection-1.jpg', alt: 'A fine gold necklace worn against a cream silk blouse' },
      { title: 'Earrings', subtitle: 'Light-catching forms, from quiet studs to evening drops.', image: '/demo-sites/jewellery/collection-2.jpg', alt: 'A pair of delicate gold earrings arranged on linen' },
      { title: 'Rings', subtitle: 'Keepsake settings for milestones, promises and yourself.', image: '/demo-sites/jewellery/collection-3.jpg', alt: 'A rose gold gemstone ring in close detail' },
      { title: 'Bridal', subtitle: 'Heirloom-inspired accents for the day and every day after.', image: '/demo-sites/jewellery/collection-4.jpg', alt: 'A pearl and gold bridal jewellery set laid out for a ceremony' },
    ],
    story: {
      eyebrow: 'Our craft',
      title: 'Jewellery designed to be cherished in the moments that matter most.',
      description: 'We curate refined jewellery for marking life’s milestones, gifting with intention and building a collection of treasured pieces that feel personal.',
      image: '/demo-sites/jewellery/story.jpg',
      alt: 'A jeweller’s hands arranging a necklace in its presentation box',
      points: ['Hand-finished design studio', 'Wedding and gifting collections', 'Modern heirloom pieces'],
      cta: 'Discover the craft',
    },
    bestsellers: [
      { name: 'The Heirloom Chain', image: '/demo-sites/jewellery/bestseller-1.jpg', alt: 'A fine gold chain arranged over an open book', description: 'A finely weighted chain with a quiet, enduring finish.', price: '₹6,500' },
      { name: 'Sculpted Gold Chain', image: '/demo-sites/jewellery/bestseller-2.jpg', alt: 'A gold chain styled among dried flowers', description: 'A considered link and warm finish for everyday layering.', price: '₹4,200' },
    ],
    gallery: [
      { image: '/demo-sites/jewellery/gallery-1.jpg', alt: 'Gold hoops resting on pale stone in sunlight' },
      { image: '/demo-sites/jewellery/gallery-2.jpg', alt: 'A fine necklace worn close to the collarbone' },
      { image: '/demo-sites/jewellery/gallery-3.jpg', alt: 'A gold bracelet photographed beside its keepsake box' },
      { image: '/demo-sites/jewellery/gallery-4.jpg', alt: 'Delicate earrings and rings styled with dried flowers' },
    ],
    finalCta: {
      title: 'Find the piece that feels like yours.',
      description: 'Share the occasion or design brief and we will help you discover a piece that feels personal, timeless and gift-worthy.',
      button: 'Enquire now',
    },
  },
};

export const getTemplateDefaults = (slugOrDesign: string): DemoBusiness => {
  const normalized = (slugOrDesign || '').toLowerCase();
  if (normalized.includes('bake') || normalized.includes('food') || normalized === 'food-bakery') {
    return demoBusinesses['demo-bakery'];
  }
  if (normalized.includes('salon') || normalized.includes('well') || normalized.includes('beauty') || normalized === 'salon-studio') {
    return demoBusinesses['demo-salon'];
  }
  if (normalized.includes('jewel') || normalized === 'jewellery-boutique') {
    return demoBusinesses['demo-jewellery'];
  }
  return demoBusinesses['demo-modern'];
};

export const getTemplateTheme = (slugOrDesign: string): WebsiteTheme => {
  const normalized = (slugOrDesign || '').toLowerCase();
  if (normalized.includes('bake') || normalized.includes('food') || normalized === 'food-bakery') {
    return demoThemes.bakery;
  }
  if (normalized.includes('salon') || normalized.includes('well') || normalized.includes('beauty') || normalized === 'salon-studio') {
    return demoThemes.salon;
  }
  if (normalized.includes('jewel') || normalized === 'jewellery-boutique') {
    return demoThemes.jewellery;
  }
  return demoThemes.modern;
};
