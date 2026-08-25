import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Two kinds of writing, deliberately.
//
//   essay - the long pieces. Threat, decision, implementation, verification,
//           residual risk. These are the interview artifacts.
//   note  - "I read something and want to think out loud about it." Low
//           friction on purpose. A note that takes an hour will not get
//           written during a teaching week.
//
// Both live in one collection so the list page, the topic pages and the feed
// never have to be taught the difference unless they want to be.
const writing = defineCollection({
  loader: glob({ base: './src/content/writing', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string(),
    // Shown under the headline on the article page. Optional for notes.
    standfirst: z.string().optional(),
    // Used for <meta name="description"> and the card blurb. Falls back to
    // standfirst if absent, so you never have to write the same line twice.
    description: z.string().optional(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    topic: z.enum(['cyber', 'ai-governance', 'career', 'reading']),
    kind: z.enum(['essay', 'note']).default('essay'),
    // Free-text label shown in the article meta row, e.g. "13 min read".
    // Left manual rather than computed: the count is not worth a dependency.
    readingTime: z.string().optional(),
    // For reading notes: what you are responding to.
    source: z
      .object({
        title: z.string(),
        url: z.string().url(),
        author: z.string().optional(),
      })
      .optional(),
    // Social preview card, as a site-root-relative path, e.g. "/og/slug.png".
    // Omit and the site-wide default at /og/default.png is used. Whatever is set
    // here must be 1200x630, because that is the size the meta tags declare and a
    // declared size that does not match the file makes some scrapers skip it.
    image: z.string().startsWith('/').optional(),
    // Alt text for that card. Falls back to a description of the default card.
    imageAlt: z.string().optional(),
    // Drafts build locally but are excluded from the list, topics and feed.
    draft: z.boolean().default(false),
    // Set true on the pieces that should surface on the landing page.
    featured: z.boolean().default(false),
  }),
});

export const collections = { writing };
