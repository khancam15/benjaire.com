import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// One JSON file per PUBLICLY APPROVED brand in src/content/brands/.
// This repository is public: never add unreleased or unapproved brands,
// not even as drafts (PRD §4.3). See src/content/brands/README.md.
const brands = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/brands' }),
  schema: z
    .object({
      name: z.string().min(1),
      description: z.string().min(1).max(160),
      category: z.enum(['consumer-tech', 'digital', 'lifestyle']),
      status: z.enum(['live', 'coming-soon']),
      website: z.url().optional(),
      logo: z.string().startsWith('/brands/'),
      order: z.number().int().default(100),
      featured: z.boolean().default(false),
    })
    .refine((b) => b.status !== 'live' || !!b.website, {
      message: 'A live brand needs a website URL.',
      path: ['website'],
    }),
});

export const collections = { brands };
