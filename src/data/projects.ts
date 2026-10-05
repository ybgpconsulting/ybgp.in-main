export interface ProjectScreenshot {
  title: string;
  description: string;
  src: string;
  group: 'Website' | 'Mobile' | 'Admin' | 'Feature';
}

export interface Project {
  id: string;
  slug: string;
  number: string;
  name: string;
  shortName?: string;
  fullName?: string;
  category: string;
  industry: string;
  projectType: string;
  status: string;
  ownership: string;
  badge: string;
  description: string;
  challenge: string;
  solution: string;
  services: string[];
  features: string[];
  workflow: string[];
  panels?: string[];
  image?: string;
  imageAlt?: string;
  liveUrl?: string;
  url: string;
  tags: string[];
  preview: 'image' | 'queue' | 'unavailable';
  ownWork?: boolean;
  isApplication?: boolean;
  sampleTemplate?: boolean;
  isLive?: boolean;
  relatedProjects: string[];
  technology: string[];
  seo: {
    title: string;
    description: string;
  };
  screenshots: ProjectScreenshot[];
}

export const PROJECTS: Project[] = [
  {
    id: 'freshera-foods',
    slug: 'freshera-foods',
    number: '01',
    name: 'Freshera Foods',
    shortName: 'Freshera',
    category: 'Food & Beverage',
    industry: 'Food & Beverage',
    projectType: 'End-to-End Business Launch / Branding / Digital Presence',
    status: 'Business currently inactive',
    ownership: 'Client Project',
    badge: 'Client Project',
    description: 'A food brand and digital presence setup for a new healthy-food business, covering brand identity, digital ordering experience, product presentation and business setup support.',
    challenge: 'The business needed a clear brand identity and a complete digital presence for local delivery and online discovery, without relying on a generic template or fragmented execution.',
    solution: 'YBGP created the brand direction, digital storefront, product presentation structure and operational setup needed to present a professional food business online.',
    services: ['Brand identity', 'Website design', 'Website development', 'Product management', 'Admin system', 'Delivery partner setup', 'Business setup support'],
    features: ['Logo and brand identity', 'Menu and category structure', 'Delivery partner links', 'Zomato and Swiggy setup', 'Admin panel for products and categories', 'Order-ready digital presentation'],
    workflow: ['Brand concept', 'Product presentation', 'Online discovery', 'Ordering and delivery setup'],
    image: '/work-freshera-foods.png',
    imageAlt: 'Freshera Foods brand website preview',
    liveUrl: 'https://fresherafoods.in/',
    url: 'https://fresherafoods.in/',
    tags: ['Brand website', 'Food & beverage', 'Business setup'],
    preview: 'image',
    relatedProjects: ['cakes-n-more', 'unique-aroma', 'freshera-foods'],
    technology: ['Branding', 'Website', 'Admin panel', 'Product management'],
    seo: {
      title: 'Freshera Foods | Business Launch and Digital Presence by YBGP',
      description: 'Explore Freshera Foods, a complete business launch and digital-presence project by YBGP covering branding, website design, product management and food delivery setup.'
    },
    screenshots: [
      { title: 'Brand-first homepage', description: 'A clean digital storefront designed to present the food brand professionally.', src: '/work-freshera-foods.png', group: 'Website' },
      { title: 'Product presentation', description: 'Meals and categories arranged for clearer customer browsing and product discovery.', src: '/work-freshera-foods.png', group: 'Feature' },
      { title: 'Business setup support', description: 'The project included digital business foundations beyond just a website build.', src: '/work-freshera-foods.png', group: 'Admin' }
    ],
    isLive: false
  },
  {
    id: 'cakes-n-more',
    slug: 'cakes-n-more',
    number: '02',
    name: 'Cakes N More',
    fullName: 'Bakery and gifting storefront',
    category: 'Bakery / Food & Beverage',
    industry: 'Bakery / Food & Beverage',
    projectType: 'E-commerce Website / Digital Transformation',
    status: 'Established Business',
    ownership: 'Client Project',
    badge: 'Established Business',
    description: 'A local bakery and gifting storefront designed for mobile shoppers, category-led browsing, WhatsApp ordering and a smoother digital order flow.',
    challenge: 'The business needed a cleaner online storefront that matched its offerings, improved customer discovery and simplified the manual order process while staying aligned with its existing workflow.',
    solution: 'YBGP developed the storefront, product organisation, category architecture, ordering journey and admin structure needed to support easier browsing and WhatsApp-based sales.',
    services: ['E-commerce website', 'Product catalogue', 'WhatsApp order flow', 'SEO', 'Admin system', 'Google Business setup'],
    features: ['Product catalogue', 'Categories', 'Cart and order summary', 'WhatsApp ordering', 'Manual shipping workflow', 'Offers management', 'Google Business Profile support'],
    workflow: ['Browse products', 'Select products', 'Add to cart', 'Customer details', 'Order summary', 'WhatsApp', 'Business confirmation'],
    image: '/work-cakes-n-more.png',
    imageAlt: 'Cakes N More assortment and storefront preview',
    liveUrl: 'https://cakesnmorenoida.in/',
    url: 'https://cakesnmorenoida.in/',
    tags: ['Bakery', 'E-commerce', 'WhatsApp ordering'],
    preview: 'image',
    relatedProjects: ['freshera-foods', 'unique-aroma', 'cortek-enterprises'],
    technology: ['E-commerce', 'Mobile UI', 'Admin panel', 'SEO'],
    seo: {
      title: 'Cakes N More E-commerce Website | YBGP Project',
      description: 'Explore the Cakes N More e-commerce website designed by YBGP, including product catalogue, cart flow, WhatsApp ordering and admin management.'
    },
    screenshots: [
      { title: 'Homepage storefront', description: 'The site presents cakes, gifts, flowers and offerings in a mobile-friendly structure.', src: '/work-cakes-n-more.png', group: 'Website' },
      { title: 'Product browsing', description: 'A product-led experience built for easy category and offer discovery.', src: '/work-cakes-n-more.png', group: 'Mobile' },
      { title: 'Admin management', description: 'The business can manage categories, products and offers through a structured admin panel.', src: '/work-cakes-n-more.png', group: 'Admin' }
    ],
    isLive: true
  },
  {
    id: 'nextq',
    slug: 'nextq',
    number: '03',
    name: 'NEXTQ',
    shortName: 'NEXTQ',
    category: 'Healthcare / Clinic Technology',
    industry: 'Healthcare',
    projectType: 'Custom Business Platform / Multi-Panel System',
    status: 'YBGP Product',
    ownership: 'YBGP Concept',
    badge: 'YBGP Product',
    description: 'A multi-panel clinic management platform concept built to connect patient booking, reception operations, doctor workflows and admin oversight in one system.',
    challenge: 'A clinic workflow needs multiple user roles and operational touchpoints to work smoothly, especially when appointments, displays and admin decisions need to stay in sync.',
    solution: 'YBGP designed a product-style platform with dedicated customer, reception, doctor, admin and display experiences tied together through one operational flow.',
    services: ['UX design', 'System architecture', 'Business workflow design', 'Admin workflows', 'Platform concept'],
    features: ['Customer booking', 'Reception panel', 'Doctor panel', 'Admin panel', 'TV display panel', 'Multi-role workflow'],
    workflow: ['Customer', 'Booking', 'Reception', 'Doctor', 'TV Display', 'Admin'],
    panels: ['Customer', 'Reception', 'Doctor', 'Admin', 'TV Display'],
    image: '/work-nextq.png',
    imageAlt: 'NEXTQ clinic platform interface',
    liveUrl: 'https://nextq.in/',
    url: 'https://nextq.in/',
    tags: ['Clinic platform', 'Business workflow', 'Custom system'],
    preview: 'image',
    isApplication: true,
    relatedProjects: ['cortek-enterprises', 'ybgp-travel', 'cakes-n-more'],
    technology: ['Clinic workflow design', 'Multi-panel UX', 'Admin dashboards', 'Operations system'],
    seo: {
      title: 'NEXTQ Clinic Platform | Custom Business Platform by YBGP',
      description: 'Explore NEXTQ, a custom clinic platform designed by YBGP with customer booking, reception, doctor, admin and TV display workflows.'
    },
    screenshots: [
      { title: 'Customer booking flow', description: 'Patients can book and track the next step in a simple customer-facing experience.', src: '/work-nextq.png', group: 'Website' },
      { title: 'Reception coordination', description: 'Reception staff can manage patient flow and queue updates across the clinic.', src: '/work-nextq.png', group: 'Feature' },
      { title: 'Doctor and admin views', description: 'Operational dashboards are split by role to make decisions and handoffs clearer.', src: '/work-nextq.png', group: 'Admin' }
    ],
    isLive: true
  },
  {
    id: 'unique-aroma',
    slug: 'unique-aroma',
    number: '04',
    name: 'Unique Aroma',
    shortName: 'Unique Aroma',
    category: 'Retail / E-commerce',
    industry: 'Retail',
    projectType: 'Startup E-commerce Website',
    status: 'Startup Project',
    ownership: 'Client Project',
    badge: 'Startup Project',
    description: 'An e-commerce website for a fragrance startup with product categories, gifting options and direct ordering flow for retail customers.',
    challenge: 'The startup needed a clean online storefront that presented product categories clearly and made it easy for customers to place orders without friction.',
    solution: 'YBGP built the storefront, product architecture, category navigation and operational links needed to support a small e-commerce business with a straightforward customer journey.',
    services: ['E-commerce website', 'Product catalogue', 'Category management', 'Shipping and payment setup', 'Admin panel'],
    features: ['Product catalogue', 'Categories', 'Ordering flow', 'Shipping options', 'Payment options', 'Social and delivery link management'],
    workflow: ['Browse products', 'Choose category', 'Select product', 'Checkout details', 'Order confirmation'],
    image: '/work-unique-aroma.png',
    imageAlt: 'Unique Aroma scented products storefront',
    liveUrl: 'https://unique-aroma.uniquearoma29.workers.dev/',
    url: 'https://unique-aroma.uniquearoma29.workers.dev/',
    tags: ['Retail', 'E-commerce', 'Startup project'],
    preview: 'image',
    relatedProjects: ['cakes-n-more', 'zewargali', 'freshera-foods'],
    technology: ['E-commerce', 'Product management', 'Ordering flow', 'Admin panel'],
    seo: {
      title: 'Unique Aroma E-commerce Website | YBGP Project',
      description: 'View the e-commerce storefront built by YBGP for Unique Aroma, including product catalogue, ordering flow and admin management.'
    },
    screenshots: [
      { title: 'Customer storefront', description: 'The website was designed to highlight fragrance collections and product discovery clearly.', src: '/work-unique-aroma.png', group: 'Website' },
      { title: 'Shopping flow', description: 'Orders flow through simple category selection and checkout-driven steps.', src: '/work-unique-aroma.png', group: 'Feature' },
      { title: 'Admin setup', description: 'The business could manage product and category structure from the backend.', src: '/work-unique-aroma.png', group: 'Admin' }
    ],
    isLive: false
  },
  {
    id: 'gandhinagar-wholesale',
    slug: 'gandhinagar-wholesale',
    number: '05',
    name: 'Gandhinagar Wholesale',
    shortName: 'Gandhinagar',
    category: 'B2B Wholesale',
    industry: 'B2B Wholesale',
    projectType: 'B2B E-commerce / Wholesale Concept',
    status: 'YBGP Concept',
    ownership: 'YBGP Concept',
    badge: 'YBGP Concept',
    description: 'A wholesale-focused concept designed to present product categories, trading flow and retailer-friendly ordering in a simple mobile-first experience.',
    challenge: 'A wholesale business often needs a tailored browsing experience for bulk buyers, with categories and enquiry pathways built around business-to-business ordering needs.',
    solution: 'YBGP created a wholesale catalog concept with a product-led layout, mobile-first browsing pattern and business ordering structure suitable for future wholesale clients.',
    services: ['Concept design', 'Wholesale catalogue structure', 'E-commerce experience', 'Admin system', 'Mobile-first UX'],
    features: ['Wholesale product catalogue', 'Product categories', 'B2B product browsing', 'Retailer enquiry flow', 'Category and product management'],
    workflow: ['Browse products', 'Filter by category', 'Review wholesale offer', 'Retailer enquiry'],
    image: '/work-gandhinagar-wholesale.png',
    imageAlt: 'Gandhinagar Wholesale concept storefront',
    liveUrl: 'https://gandhinagar-wholesale.ybgp-consulting.workers.dev/',
    url: 'https://gandhinagar-wholesale.ybgp-consulting.workers.dev/',
    tags: ['B2B', 'Wholesale concept', 'Mobile-first'],
    preview: 'image',
    sampleTemplate: true,
    relatedProjects: ['cortek-enterprises', 'ybgp-travel', 'nextq'],
    technology: ['Wholesale catalog', 'Mobile-first design', 'Category management', 'Admin panel'],
    seo: {
      title: 'Gandhinagar Wholesale | B2B E-commerce Concept by YBGP',
      description: 'Explore the Gandhinagar Wholesale B2B concept designed by YBGP, featuring wholesale product categories and a mobile-first catalogue experience.'
    },
    screenshots: [
      { title: 'Wholesale catalogue', description: 'The concept presents products in a clean B2B-friendly structure.', src: '/work-gandhinagar-wholesale.png', group: 'Website' },
      { title: 'Mobile-first layout', description: 'A responsive experience designed for browsing on smaller screens.', src: '/work-gandhinagar-wholesale.png', group: 'Mobile' },
      { title: 'Admin structure', description: 'Products and categories are organised to support easy future scaling.', src: '/work-gandhinagar-wholesale.png', group: 'Admin' }
    ],
    isLive: false
  },
  {
    id: 'zewargali',
    slug: 'zewargali',
    number: '06',
    name: 'ZewarGali',
    shortName: 'ZewarGali',
    category: 'Jewellery / Retail',
    industry: 'Jewellery',
    projectType: 'E-commerce Platform',
    status: 'Startup Project',
    ownership: 'Client Project',
    badge: 'Startup Project',
    description: 'A jewellery e-commerce storefront built for category-led discovery, ordering and customer navigation with a streamlined retail presentation.',
    challenge: 'The business needed a digital storefront that balanced elegant product presentation with a straightforward ordering and admin workflow.',
    solution: 'YBGP created the product catalogue, category structure and e-commerce flow to present the jewellery brand clearly and support simple business operations.',
    services: ['E-commerce website', 'Product catalogue', 'Category management', 'Ordering flow', 'Admin system'],
    features: ['Jewellery catalogue', 'Product categories', 'Ordering', 'Shipping options', 'Payment options', 'Delivery partner links'],
    workflow: ['Browse catalogue', 'Select product', 'Review details', 'Place order'],
    image: '/work-zewar-gali.png',
    imageAlt: 'ZewarGali jewellery storefront preview',
    liveUrl: 'https://zewargali-in.ybgp-consulting.workers.dev/',
    url: 'https://zewargali-in.ybgp-consulting.workers.dev/',
    tags: ['Jewellery', 'E-commerce', 'Startup project'],
    preview: 'image',
    sampleTemplate: true,
    relatedProjects: ['unique-aroma', 'cakes-n-more', 'ybgp-travel'],
    technology: ['E-commerce', 'Category browsing', 'Order flow', 'Admin panel'],
    seo: {
      title: 'ZewarGali Jewellery E-commerce Website | YBGP Project',
      description: 'See the jewellery e-commerce platform built by YBGP for ZewarGali, including product discovery, ordering and admin management.'
    },
    screenshots: [
      { title: 'Jewellery catalogue', description: 'The storefront is designed with clear product discovery and premium visual hierarchy.', src: '/work-zewar-gali.png', group: 'Website' },
      { title: 'Product browsing', description: 'Category-led navigation helps customers move from discovery to a product detail page quickly.', src: '/work-zewar-gali.png', group: 'Mobile' },
      { title: 'Management tools', description: 'The backend supports products, categories and online ordering operations.', src: '/work-zewar-gali.png', group: 'Admin' }
    ],
    isLive: false
  },
  {
    id: 'cortek-enterprises',
    slug: 'cortek-enterprises',
    number: '07',
    name: 'Cortek Enterprises',
    shortName: 'Cortek',
    category: 'Retail / Business',
    industry: 'Retail / Business',
    projectType: 'E-commerce + Inventory Management',
    status: 'Established Business',
    ownership: 'Client Project',
    badge: 'Established Business',
    description: 'A business and customer-facing platform combining e-commerce browsing with live inventory visibility and internal operational management.',
    challenge: 'The business needed a storefront that presented products clearly while also giving staff and managers visibility into stock status and product operations.',
    solution: 'YBGP developed a dual-facing system that supports customer browsing and business-side inventory and product management, with admin and staff workflows built around live stock visibility.',
    services: ['E-commerce website', 'Inventory platform', 'Admin panel', 'Staff panel', 'Product management'],
    features: ['Live stock availability', 'Product catalogue', 'Categories', 'Admin panel', 'Staff panel', 'Business management'],
    workflow: ['Customer', 'Browse', 'Check live stock', 'Order', 'Admin/Staff', 'Manage products', 'Update stock', 'Customer sees updated availability'],
    image: '/work-cortek-enterprises.png',
    imageAlt: 'Cortek Enterprises storefront and inventory platform',
    liveUrl: 'https://cortek-enterprises.ybgp-consulting.workers.dev/',
    url: 'https://cortek-enterprises.ybgp-consulting.workers.dev/',
    tags: ['Inventory', 'E-commerce', 'Business management'],
    preview: 'image',
    isApplication: true,
    relatedProjects: ['nextq', 'gandhinagar-wholesale', 'cakes-n-more'],
    technology: ['Inventory visibility', 'Admin and staff panels', 'Category management', 'Business operations'],
    seo: {
      title: 'Cortek Enterprises Inventory Platform | YBGP Project',
      description: 'Explore the Cortek Enterprises e-commerce and inventory management project by YBGP, featuring live stock visibility and business operations workflows.'
    },
    screenshots: [
      { title: 'Customer-facing catalog', description: 'Products are presented in a way that supports browsing and stock confidence.', src: '/work-cortek-enterprises.png', group: 'Website' },
      { title: 'Live inventory visibility', description: 'Stock and availability are surfaced in a business-friendly way for customer confidence.', src: '/work-cortek-enterprises.png', group: 'Feature' },
      { title: 'Admin and staff workflows', description: 'Management screens support product and stock operations across the business.', src: '/work-cortek-enterprises.png', group: 'Admin' }
    ],
    isLive: true
  },
  {
    id: 'ybgp-travel',
    slug: 'ybgp-travel',
    number: '08',
    name: 'YBGP Travel',
    shortName: 'YBGP Travel',
    fullName: 'A YBGP Concept',
    category: 'Travel',
    industry: 'Travel',
    projectType: 'Travel Booking Platform',
    status: 'YBGP Concept',
    ownership: 'YBGP Concept',
    badge: 'YBGP Concept',
    description: 'A travel booking concept created to package destination inspiration, holiday presentation and booking-oriented journeys into a clean mobile-first experience.',
    challenge: 'Travel businesses need a digital experience that presents packages, categories and service options clearly while keeping the customer journey simple and action-oriented.',
    solution: 'YBGP created a concept for destination-led travel discovery, package presentation and booking-oriented browsing that can be adapted for future travel clients.',
    services: ['Travel package concept', 'Product presentation', 'Category structure', 'Admin platform', 'Mobile-first UX'],
    features: ['Travel package presentation', 'Booking-oriented experience', 'Category management', 'Admin panel', 'Mobile-first design'],
    workflow: ['Discover destination', 'Review package', 'Choose trip', 'Booking journey'],
    image: '/work-ybgp-travel.png',
    imageAlt: 'YBGP Travel concept homepage',
    liveUrl: 'https://ybgp-travel-concept.ybgp-consulting.workers.dev/',
    url: 'https://ybgp-travel-concept.ybgp-consulting.workers.dev/',
    tags: ['Travel concept', 'Booking platform', 'Mobile-first'],
    preview: 'image',
    relatedProjects: ['nextq', 'gandhinagar-wholesale', 'cortek-enterprises'],
    technology: ['Travel packages', 'Category browsing', 'Admin panel', 'Mobile-first design'],
    seo: {
      title: 'YBGP Travel | Travel Booking Platform Concept',
      description: 'Explore the YBGP Travel concept, a travel booking and package presentation platform designed by YBGP for future travel business opportunities.'
    },
    screenshots: [
      { title: 'Travel showcase', description: 'The concept uses destination-first storytelling and package-led browsing.', src: '/work-ybgp-travel.png', group: 'Website' },
      { title: 'Mobile journey', description: 'A mobile-first structure keeps trip discovery and booking navigation simple.', src: '/work-ybgp-travel.png', group: 'Mobile' },
      { title: 'Management panel', description: 'The concept includes product and category management for future business scaling.', src: '/work-ybgp-travel.png', group: 'Admin' }
    ],
    isLive: false
  }
];

export const getProjectBySlug = (slug: string) => PROJECTS.find((project) => project.slug === slug);
export const getProjectById = (id: string) => PROJECTS.find((project) => project.id === id);

export const PROJECT_ROUTE_METADATA = Object.fromEntries(
  PROJECTS.map((project) => [
    `work/${project.slug}`,
    {
      title: project.seo.title,
      description: project.seo.description
    }
  ])
) as Record<string, { title: string; description: string }>;

export const WORK_FILTERS = ['All', 'Websites', 'E-commerce', 'Business Platforms', 'B2B', 'Concepts'] as const;
