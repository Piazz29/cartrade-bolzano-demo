import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const localized = z.object({ it: z.string(), de: z.string() });

// Parco auto. In questa demo tutte le schede hanno `demo: true`:
// TODO: sostituire con l'elenco reale delle auto in vendita (o collegare il gestionale / AutoScout24).
const cars = defineCollection({
  loader: glob({ base: './src/content/cars', pattern: '*.json' }),
  schema: z.object({
    demo: z.boolean().default(true),
    make: z.string(),
    model: z.string(),
    version: z.string(),
    condition: z.enum(['used', 'km0']),
    year: z.number().int(),
    registration: z.string(), // AAAA-MM prima immatricolazione
    km: z.number().int(),
    price: z.number().int(),
    fuel: z.enum(['diesel', 'petrol', 'hybrid', 'phev']),
    gearbox: z.enum(['manual', 'automatic']),
    drive: z.enum(['fwd', 'awd', 'rwd']),
    powerKw: z.number().int(),
    powerCv: z.number().int(),
    body: z.enum(['suv', 'wagon', 'hatchback', 'city']),
    color: localized,
    doors: z.number().int(),
    seats: z.number().int(),
    euro: z.string(),
    owners: z.number().int(),
    warrantyMonths: z.number().int(),
    consumption: z.string().optional(), // l/100 km WLTP misto
    featured: z.boolean().default(false),
    images: z
      .array(z.object({ id: z.string(), alt: localized, position: z.string().optional() }))
      .min(1),
    features: z.object({ it: z.array(z.string()), de: z.array(z.string()) }),
    description: localized,
  }),
});

export const collections = { cars };
