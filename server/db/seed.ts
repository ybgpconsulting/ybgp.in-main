import type { RowDataPacket } from 'mysql2';
import { hashPassword } from '../auth/password.js';
import { WEBSITE_TEMPLATES } from '../templates/catalog.js';
import { pool } from './pool.js';

const demoPassword = 'Ybgp-Dev-Only-6cV9-Qm2X!Local';

interface IdRow extends RowDataPacket {
  id: number;
}

interface BusinessSeed {
  slug: string;
  name: string;
  category: string;
  description: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string | null;
  templateSlug: string;
  ownerName: string;
  ownerEmail: string;
  categories: Array<{
    name: string;
    products: Array<{ name: string; slug: string; description: string; price: number }>;
  }>;
  gallery: Array<{ title: string; image: string }>;
  settings: Array<{ key: string; value: string }>;
  enquiry: { name: string; phone: string; message: string };
}

const businesses: BusinessSeed[] = [
  {
    slug: 'aroma-and-crumb',
    name: 'Aroma & Crumb',
    category: 'Bakery & Gifting',
    description: 'A friendly neighbourhood bakery for custom cakes, fresh bakes, and thoughtfully packed gifts.',
    phone: '+1-202-555-0121',
    whatsapp: '12025550121',
    email: 'hello@aroma-crumb.demo.test',
    address: null,
    templateSlug: 'food-bakery',
    ownerName: 'Aroma & Crumb Demo Owner',
    ownerEmail: 'owner@aroma-crumb.demo.test',
    categories: [
      {
        name: 'Signature Cakes',
        products: [
          { name: 'Vanilla Berry Celebration Cake', slug: 'vanilla-berry-celebration-cake', description: 'A demo vanilla sponge layered with berries and a light cream finish.', price: 32 },
          { name: 'Chocolate Celebration Cake', slug: 'chocolate-celebration-cake', description: 'A demo cocoa sponge with smooth chocolate frosting.', price: 36 }
        ]
      },
      {
        name: 'Gifting',
        products: [
          { name: 'Weekend Treat Box', slug: 'weekend-treat-box', description: 'A sample box of assorted cookies and small-batch bakes.', price: 24 }
        ]
      }
    ],
    gallery: [
      { title: 'Berry celebration cake', image: '/uploads/businesses/aroma-and-crumb/gallery/demo-berry-cake.jpg' },
      { title: 'Weekend treat selection', image: '/uploads/businesses/aroma-and-crumb/gallery/demo-treat-box.jpg' }
    ],
    settings: [
      { key: 'accent_color', value: '#B96345' },
      { key: 'show_product_prices', value: 'true' },
      { key: 'currency', value: 'USD (demo)' }
    ],
    enquiry: {
      name: 'Demo Bakery Visitor',
      phone: '+1-202-555-0131',
      message: 'Hello, I would like to ask about a celebration cake. This is sample enquiry data.'
    }
  },
  {
    slug: 'maison-gloss',
    name: 'Maison Gloss',
    category: 'Salon & Wellness',
    description: 'A calm demo salon and wellness studio offering personal care, beauty, and styling services.',
    phone: '+1-202-555-0122',
    whatsapp: '12025550122',
    email: 'hello@maison-gloss.demo.test',
    address: null,
    templateSlug: 'modern-business',
    ownerName: 'Maison Gloss Demo Owner',
    ownerEmail: 'owner@maison-gloss.demo.test',
    categories: [
      {
        name: 'Hair & Styling',
        products: [
          { name: 'Signature Haircut', slug: 'signature-haircut', description: 'A demo consultation and haircut appointment.', price: 28 },
          { name: 'Event Styling', slug: 'event-styling', description: 'A sample styling service for a special occasion.', price: 45 }
        ]
      },
      {
        name: 'Wellness',
        products: [
          { name: 'Relaxing Facial', slug: 'relaxing-facial', description: 'A demo facial treatment using gentle skincare products.', price: 52 }
        ]
      }
    ],
    gallery: [
      { title: 'Studio styling area', image: '/uploads/businesses/maison-gloss/gallery/demo-styling-area.jpg' },
      { title: 'Wellness treatment room', image: '/uploads/businesses/maison-gloss/gallery/demo-treatment-room.jpg' }
    ],
    settings: [
      { key: 'accent_color', value: '#937B78' },
      { key: 'show_product_prices', value: 'true' },
      { key: 'currency', value: 'USD (demo)' }
    ],
    enquiry: {
      name: 'Demo Salon Visitor',
      phone: '+1-202-555-0132',
      message: 'Hello, I would like to ask about an appointment. This is sample enquiry data.'
    }
  }
];

const getId = async (
  connection: Awaited<ReturnType<typeof pool.getConnection>>,
  query: string,
  values: Array<string | number>,
  recordName: string
): Promise<number> => {
  const [rows] = await connection.execute<IdRow[]>(query, values);
  const row = rows[0];
  if (!row) {
    throw new Error(`Expected seeded record not found: ${recordName}`);
  }
  return row.id;
};

const upsertSetting = async (
  connection: Awaited<ReturnType<typeof pool.getConnection>>,
  businessId: number,
  key: string,
  value: string
): Promise<void> => {
  await connection.execute(
    `INSERT INTO business_settings (business_id, setting_key, setting_value)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
    [businessId, key, value]
  );
};

const seed = async (): Promise<void> => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('The development database seed cannot run when NODE_ENV=production');
  }

  const passwordHash = await hashPassword(demoPassword);
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    for (const template of WEBSITE_TEMPLATES) {
      await connection.execute(
        `INSERT INTO templates (name, slug, description, preview_image, status)
         VALUES (?, ?, ?, NULL, 'ACTIVE')
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           description = VALUES(description),
           status = VALUES(status)`,
        [template.name, template.slug, template.description]
      );
    }

    await connection.execute(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES (?, ?, ?, 'SUPER_ADMIN')
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         password_hash = VALUES(password_hash),
         role = VALUES(role)`,
      ['YBGP Local Development Admin', 'admin@ybgp.local', passwordHash]
    );

    const templateIds = new Map<string, number>();
    for (const template of WEBSITE_TEMPLATES) {
      const templateSlug = template.slug;
      templateIds.set(
        templateSlug,
        await getId(connection, 'SELECT id FROM templates WHERE slug = ?', [templateSlug], `template ${templateSlug}`)
      );
    }

    for (const business of businesses) {
      const templateId = templateIds.get(business.templateSlug);
      if (templateId === undefined) {
        throw new Error(`Missing template ID for ${business.templateSlug}`);
      }

      await connection.execute(
        `INSERT INTO businesses (
           name, slug, category, logo, description, phone, whatsapp, email, address,
           google_maps_url, instagram_url, facebook_url, business_hours, template_id, status
         )
         VALUES (?, ?, ?, NULL, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, ?, 'ACTIVE')
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           category = VALUES(category),
           description = VALUES(description),
           phone = VALUES(phone),
           whatsapp = VALUES(whatsapp),
           email = VALUES(email),
           address = VALUES(address),
           google_maps_url = VALUES(google_maps_url),
           template_id = VALUES(template_id),
           status = VALUES(status)`,
        [
          business.name,
          business.slug,
          business.category,
          business.description,
          business.phone,
          business.whatsapp,
          business.email,
          business.address,
          templateId
        ]
      );

      await connection.execute(
        `INSERT INTO users (name, email, password_hash, role)
         VALUES (?, ?, ?, 'BUSINESS_OWNER')
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           password_hash = VALUES(password_hash),
           role = VALUES(role)`,
        [business.ownerName, business.ownerEmail, passwordHash]
      );

      const businessId = await getId(connection, 'SELECT id FROM businesses WHERE slug = ?', [business.slug], `business ${business.slug}`);
      const ownerId = await getId(connection, 'SELECT id FROM users WHERE email = ?', [business.ownerEmail], `owner ${business.ownerEmail}`);

      await connection.execute(
        `INSERT INTO business_users (business_id, user_id, role)
         VALUES (?, ?, 'BUSINESS_OWNER')
         ON DUPLICATE KEY UPDATE role = VALUES(role)`,
        [businessId, ownerId]
      );

      for (const [categoryIndex, category] of business.categories.entries()) {
        await connection.execute(
          `INSERT INTO categories (business_id, name, sort_order, status)
           VALUES (?, ?, ?, 'ACTIVE')
           ON DUPLICATE KEY UPDATE sort_order = VALUES(sort_order), status = VALUES(status)`,
          [businessId, category.name, categoryIndex]
        );

        const categoryId = await getId(
          connection,
          'SELECT id FROM categories WHERE business_id = ? AND name = ?',
          [businessId, category.name],
          `category ${category.name} for ${business.slug}`
        );

        for (const [productIndex, product] of category.products.entries()) {
          await connection.execute(
            `INSERT INTO products (
               business_id, category_id, name, slug, description, price, image, status, sort_order
             )
             VALUES (?, ?, ?, ?, ?, ?, NULL, 'ACTIVE', ?)
             ON DUPLICATE KEY UPDATE
               category_id = VALUES(category_id),
               name = VALUES(name),
               description = VALUES(description),
               price = VALUES(price),
               status = VALUES(status),
               sort_order = VALUES(sort_order)`,
            [businessId, categoryId, product.name, product.slug, product.description, product.price, productIndex]
          );
        }
      }

      for (const [galleryIndex, item] of business.gallery.entries()) {
        await connection.execute(
          `INSERT INTO gallery (business_id, image, title, sort_order, status)
           VALUES (?, ?, ?, ?, 'ACTIVE')
           ON DUPLICATE KEY UPDATE image = VALUES(image), sort_order = VALUES(sort_order), status = VALUES(status)`,
          [businessId, item.image, item.title, galleryIndex]
        );
      }

      for (const setting of business.settings) {
        await upsertSetting(connection, businessId, setting.key, setting.value);
      }

      await connection.execute(
        `INSERT INTO subscriptions (business_id, plan, amount, start_date, expiry_date, status)
         VALUES (?, 'Starter', 1999.00, CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 1 YEAR), 'ACTIVE')
         ON DUPLICATE KEY UPDATE
           plan = VALUES(plan),
           amount = VALUES(amount),
           start_date = VALUES(start_date),
           expiry_date = VALUES(expiry_date),
           status = VALUES(status)`,
        [businessId]
      );

      await connection.execute(
        `INSERT INTO enquiries (business_id, name, phone, message, source, status)
         SELECT ?, ?, ?, ?, 'WEBSITE', 'NEW'
         WHERE NOT EXISTS (
           SELECT 1 FROM enquiries
           WHERE business_id = ? AND name = ? AND phone = ? AND message = ?
         )`,
        [
          businessId,
          business.enquiry.name,
          business.enquiry.phone,
          business.enquiry.message,
          businessId,
          business.enquiry.name,
          business.enquiry.phone,
          business.enquiry.message
        ]
      );
    }

    await connection.commit();
    console.info('Development seed complete: admin, two businesses, owners, templates, categories, products, gallery, enquiries, subscriptions, and settings.');
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
};

void seed().catch((error: unknown) => {
  console.error('Development database seed failed:', error);
  process.exitCode = 1;
});
