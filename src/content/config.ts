import { defineCollection, z } from 'astro:content';

export const collections = {
  'docs': defineCollection({
    schema: z.object({
      title: z.string(),
      description: z.string().optional(),
      order: z.number().optional(),
      category: z.string().optional(),
    }),
  }),
};