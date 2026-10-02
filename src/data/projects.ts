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
  sampleTemplate?: boolean;
}

export const PROJECTS: Project[] = [
  {
    id: 'ybgp',
    number: '01',
    name: 'YBGP',
    fullName: 'Your Business Growth Partner',
    category: 'Business Growth / Consulting / Digital',
    description: 'Our own website brings YBGP’s business consulting offer, services and enquiry path together in one digital home.',
    image: '/work-ybgp.png',
    imageAlt: 'YBGP homepage preview',
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
    description: 'A healthy-food delivery website for Sector 168, Noida, showcasing 100% vegetarian burgers, sandwiches, pasta, protein-focused meals and fresh fruit shakes.',
    image: '/work-freshera-foods.png',
    imageAlt: 'Freshera Foods healthy food delivery homepage',
    url: 'https://fresherafoods.in/',
    tags: ['Brand website', 'Food & beverage', 'Local ordering'],
    preview: 'image'
  },
  {
    id: 'cakes-n-more',
    number: '03',
    name: 'Cakes N More',
    category: 'Bakery / Local Business Website',
    description: 'A Sector 76, Noida bakery and florist storefront for 100% eggless cakes, flower bouquets, gifts, plants and celebration hampers, with local delivery and WhatsApp ordering.',
    image: '/work-cakes-n-more.png',
    imageAlt: 'Cakes N More homepage showing cakes, flowers and gifts',
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
    image: '/work-nextq.png',
    imageAlt: 'NEXTQ clinic appointment and live queue management homepage',
    url: 'https://nextq.in/',
    tags: ['Clinic software', 'Queue management', 'Patient booking'],
    preview: 'image',
    isApplication: true
  },
  {
    id: 'unique-aroma',
    number: '05',
    name: 'Unique Aroma',
    category: 'Home Fragrance / E-commerce',
    description: 'An artisanal home-fragrance storefront for hand-poured soy candles, DIY candle kits, gift hampers and aromatherapy collections, with direct WhatsApp ordering.',
    image: '/work-unique-aroma.png',
    imageAlt: 'Unique Aroma homepage showing artisanal candles and DIY kits',
    url: 'https://unique-aroma.uniquearoma29.workers.dev/',
    tags: ['Soy candles', 'DIY kits', 'E-commerce'],
    preview: 'image'
  },
  {
    id: 'gandhinagar-wholesale',
    number: '06',
    name: 'Gandhinagar Wholesale',
    category: 'Garments Wholesale / Sample Template',
    description: 'A sample template for a garments wholesale business in Gandhi Nagar, Delhi, with a product-catalogue structure, wholesale-only messaging and enquiry paths for retailers and resellers.',
    image: '/work-gandhinagar-wholesale.png',
    imageAlt: 'Desktop homepage screenshot of the Gandhinagar Wholesale sample storefront',
    url: 'https://gandhinagar-wholesale.ybgp-consulting.workers.dev/',
    tags: ['Garments', 'Wholesale catalogue', 'Sample template'],
    preview: 'image',
    sampleTemplate: true
  },
  {
    id: 'zewargali',
    number: '07',
    name: 'Zewar Gali',
    category: 'Jewellery E-commerce / Sample Template',
    description: 'A sample e-commerce storefront for a jewellery business, with category-led product discovery, product details, payment and delivery information, and direct WhatsApp ordering.',
    image: '/work-zewar-gali.png',
    imageAlt: 'Desktop homepage screenshot of the Zewar Gali jewellery sample storefront',
    url: 'https://zewargali-in.ybgp-consulting.workers.dev/',
    tags: ['Jewellery', 'E-commerce', 'WhatsApp ordering', 'Sample template'],
    preview: 'image',
    sampleTemplate: true
  },
  {
    id: 'cortek-enterprises',
    number: '08',
    name: 'Cortek Enterprises',
    category: 'Consumer Electronics Inventory / E-commerce Platform',
    description: 'A live consumer-electronics inventory platform for Cortek Enterprises, presenting available devices, stock readiness, product conditions and customer safety checks.',
    image: '/work-cortek-enterprises.png',
    imageAlt: 'Cortek Enterprises electronics inventory homepage',
    url: 'https://cortek-enterprises.ybgp-consulting.workers.dev/',
    tags: ['Web application', 'Business management'],
    preview: 'image',
    isApplication: true
  }
];
