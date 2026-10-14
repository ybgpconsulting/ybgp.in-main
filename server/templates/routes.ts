import { Router } from 'express';
import type { RowDataPacket } from 'mysql2';
import { pool } from '../db/pool.js';

const router = Router();

interface TemplateRow extends RowDataPacket {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  preview_image: string | null;
  status: 'ACTIVE' | 'INACTIVE';
}

router.get('/', async (_request, response) => {
  const [rows] = await pool.execute<TemplateRow[]>(
    `SELECT id, name, slug, description, preview_image, status
     FROM templates
     WHERE status = 'ACTIVE'
     ORDER BY name ASC`
  );

  response.json({ templates: rows.map((template) => ({
    id: template.id,
    name: template.name,
    slug: template.slug,
    description: template.description,
    preview_image: template.preview_image,
    status: template.status,
  })) });
});

export default router;
