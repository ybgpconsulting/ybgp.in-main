export interface Project {
  id: string;
  number: string;
  name: string;
  fullName?: string;
  category: string;
  description: string;
  image?: string;
  imageAlt?: string;
  url: string;
  tags: string[];
  preview: 'image' | 'queue' | 'unavailable';
  ownWork?: boolean;
  isApplication?: boolean;
}

export const PROJECTS: Project[] = [
  {
    id: 'ybgp',
    number: '01',
    name: 'YBGP',
    fullName: 'Your Business Growth Partner',
    category: 'Business Growth / Consulting / Digital',
    description: 'Our own website brings YBGP’s business consulting offer, services and enquiry path together in one digital home.',
    image: '/og-image.svg',
    imageAlt: 'YBGP brand artwork and the From Idea to a Profitable Business tagline',
    url: 'https://ybgp.in/',
    tags: ['Consulting', 'Digital experience'],
    preview: 'image',
    ownWork: true
  },
  {
    id: 'freshera-foods',
    number: '02',
    name: 'Freshera Foods',
    category: 'Food & Beverage / Brand Website',
    description: 'A brand website presenting Freshera Foods’ vegetarian menu, fresh shakes and local ordering details for Sector 168, Noida.',
    image: '/freshera-foods-preview.webp',
    imageAlt: 'Freshera Foods homepage food photography',
    url: 'https://fresherafoods.in/',
    tags: ['Brand website', 'Food & beverage', 'Local ordering'],
    preview: 'image'
  },
  {
    id: 'cakes-n-more',
    number: '03',
    name: 'Cakes N More',
    category: 'Bakery / Local Business Website',
    description: 'A bakery and florist storefront showcasing cakes, flowers and gifts with product browsing and local ordering information.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1600&auto=format&fit=crop',
    imageAlt: 'Cake featured on the Cakes N More homepage',
    url: 'https://cakesnmorenoida.in/',
    tags: ['Bakery', 'Flowers & gifts', 'Online storefront'],
    preview: 'image'
  },
  {
    id: 'nextq',
    number: '04',
    name: 'NextQ',
    category: 'Clinic Queue Management / Appointment Software',
    description: 'A clinic appointment and queue experience connecting patient booking with reception, doctor and display views, including live token tracking.',
    imageAlt: 'NEXTQ clinic queue dashboard preview based on the live homepage',
    url: 'https://nextq.in/',
    tags: ['Clinic software', 'Queue management', 'Patient booking'],
    preview: 'queue',
    isApplication: true
  },
  {
    id: 'unique-aroma',
    number: '05',
    name: 'Unique Aroma',
    category: 'Home Fragrance / E-commerce',
    description: 'A product storefront for artisanal soy candles and DIY candle kits, organized around its candle and home-fragrance collections.',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1600&q=85',
    imageAlt: 'Hand-poured candle product featured on the Unique Aroma homepage',
    url: 'https://unique-aroma.uniquearoma29.workers.dev/',
    tags: ['Soy candles', 'DIY kits', 'E-commerce'],
    preview: 'image'
  },
  {
    id: 'cortek-enterprises',
    number: '06',
    name: 'Cortek Enterprises',
    category: 'Business Management Platform / Web Application',
    description: 'A custom business management platform presented as a web application. The supplied live project URL is currently returning a 404 response.',
    url: 'https://cortek-enterprises-production.up.railway.app/',
    tags: ['Web application', 'Business management'],
    preview: 'unavailable',
    isApplication: true
  }
];