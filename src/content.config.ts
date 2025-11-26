import { defineCollection, z } from 'astro:content';

const baseArticleSchema = z.object({
  id: z.union([z.string(), z.number()]).transform((v) => v.toString()),
  title: z.string(),
  image: z.string().url().optional(),
  tags: z
    .union([
      z.array(z.string()),
      z.string(),
      z.undefined(),
      z.null(),
    ])
    .optional()
    .transform((value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string' && value.trim().length > 0) {
        return [value];
      }
      return [];
    }),
  date: z
    .union([z.string(), z.date()])
    .optional()
    .transform((value) => {
      if (!value) return undefined;
      if (value instanceof Date) return value;
      const d = new Date(value);
      return isNaN(d.getTime()) ? undefined : d;
    }),
  oldUrl: z.string().optional(),
});

const articles = defineCollection({
  type: 'content',
  schema: baseArticleSchema,
});

const archive = defineCollection({
  type: 'content',
  schema: baseArticleSchema,
});

export const collections = { articles, archive };

