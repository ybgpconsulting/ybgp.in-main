import type { BusinessWebsiteResponse } from './PublicWebsiteRenderer';

const createWebsite = ({
  name,
  slug,
  category,
  description,
  templateName,
  templateSlug,
  city,
  products,
  gallery,
}: {
  name: string;
  slug: string;
  category: string;
  description: string;
  templateName: string;
  templateSlug: string;
  city: string;
  products: Array<{ name: string; description: string; price: string | null; image?: string }>;
  gallery: Array<{ title: string; image: string }>;
}): BusinessWebsiteResponse => ({
  business: {
    name,
    slug,
    category,
    description,
    phone: '+91 98765 43210',
    whatsapp: '919876543210',
    email: `hello@${slug}.demo.test`,
    address: 'By appointment',
  },
  template: { name: templateName, slug: templateSlug },
  settings: {
    city,
    cta_text: 'Contact us',
    working_hours: 'Monday – Saturday, 10:00 AM – 7:00 PM',
    show_product_prices: 'true',
    currency: 'INR',
  },
  categories: [{ id: '1', name: category, status: 'ACTIVE' }],
  products: products.map((product, index) => ({
    id: String(index + 1),
    category_id: '1',
    slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    ...product,
    image: product.image ?? null,
    status: 'ACTIVE',
  })),
  gallery: gallery.map((item, index) => ({ id: String(index + 1), ...item, status: 'ACTIVE' })),
  seo: {
    title: `${name} | ${templateName} Demo`,
    description,
    canonicalUrl: `https://www.ybgp.in/websites/${slug}/`,
    ogTitle: `${name} | ${templateName} Demo`,
    ogDescription: description,
    ogImage: gallery[0]?.image,
  },
  subscription: { plan: null, amount: null, status: null },
});

const demoWebsites: Record<string, BusinessWebsiteResponse> = {
  'demo-modern': createWebsite({
    name: 'Willow & Stone Studio',
    slug: 'demo-modern',
    category: 'Creative & professional services',
    description: 'A thoughtful, flexible website for a modern local business. Share your services, introduce your team, and make it easy for customers to get in touch.',
    templateName: 'Modern Business',
    templateSlug: 'modern-business',
    city: 'Your city',
    products: [
      { name: 'Business Consultation', description: 'A one-to-one conversation to understand your needs and find the right next step.', price: '1500' },
      { name: 'Brand & Website Review', description: 'Practical guidance to make your online presence clearer and more useful.', price: '2500' },
      { name: 'Ongoing Support', description: 'Reliable help and advice for your business as it grows.', price: null },
    ],
    gallery: [],
  }),
  'demo-bakery': createWebsite({
    name: 'Aroma & Crumb',
    slug: 'demo-bakery',
    category: 'Bakery & gifting',
    description: 'Custom cakes, handcrafted desserts, and thoughtful gifting for every celebration.',
    templateName: 'Food / Bakery',
    templateSlug: 'food-bakery',
    city: 'Mumbai',
    products: [
      { name: 'Cocoa Velvet Cake', description: 'Dark chocolate layers with a silky ganache finish.', price: '2199', image: '/demo-sites/bakery/bestseller-1.jpg' },
      { name: 'Berry Celebration Slice', description: 'Soft sponge, bright berries, and a delicate cream finish.', price: '499', image: '/demo-sites/bakery/bestseller-2.jpg' },
      { name: 'Brown Butter Cupcake', description: 'A tender crumb, rich cocoa, and house-made frosting.', price: '220', image: '/demo-sites/bakery/bestseller-3.jpg' },
    ],
    gallery: [
      { title: 'Freshly baked for every occasion', image: '/demo-sites/bakery/hero.jpg' },
      { title: 'A little something to share', image: '/demo-sites/bakery/gallery-2.jpg' },
    ],
  }),
  'demo-salon': createWebsite({
    name: 'Maison Gloss',
    slug: 'demo-salon',
    category: 'Salon & wellness',
    description: 'Thoughtful beauty experiences designed around your style, confidence, and wellbeing.',
    templateName: 'Salon & Wellness',
    templateSlug: 'salon-studio',
    city: 'Pune',
    products: [
      { name: 'The Maison Blowout', description: 'Soft volume and a polished finish with lasting movement.', price: '2800', image: '/demo-sites/salon/bestseller-1.jpg' },
      { name: 'The Glow Facial', description: 'A restorative facial focused on comfort, hydration, and glow.', price: '3600', image: '/demo-sites/salon/bestseller-2.jpg' },
      { name: 'The Bridal Edit', description: 'A personal trial to find the right tones, texture, and finish.', price: null, image: '/demo-sites/salon/bestseller-3.jpg' },
    ],
    gallery: [
      { title: 'A calm space to reset', image: '/demo-sites/salon/hero.jpg' },
      { title: 'Thoughtful care, tailored to you', image: '/demo-sites/salon/gallery-2.jpg' },
    ],
  }),
  'demo-jewellery': createWebsite({
    name: 'Silver Elara',
    slug: 'demo-jewellery',
    category: 'Jewellery boutique',
    description: 'A considered collection of distinctive pieces, chosen to bring a little meaning to every day.',
    templateName: 'Jewellery Boutique',
    templateSlug: 'jewellery-boutique',
    city: 'Jaipur',
    products: [
      { name: 'Sculpted Gold Pendant', description: 'A refined everyday pendant with a softly sculpted finish.', price: '6400', image: '/demo-sites/jewellery/bestseller-1.jpg' },
      { name: 'The Heirloom Cuff', description: 'A timeless statement piece with an artful, hand-finished form.', price: '8900', image: '/demo-sites/jewellery/bestseller-2.jpg' },
      { name: 'Pearl Drop Earrings', description: 'A graceful pair made for celebrations and keepsake moments.', price: '5200', image: '/demo-sites/jewellery/collection-3.jpg' },
    ],
    gallery: [
      { title: 'A study in form and light', image: '/demo-sites/jewellery/hero.jpg' },
      { title: 'Made to be treasured', image: '/demo-sites/jewellery/gallery-2.jpg' },
    ],
  }),
};

export const getDemoWebsite = (slug: string): BusinessWebsiteResponse | null =>
  demoWebsites[slug] ?? null;
