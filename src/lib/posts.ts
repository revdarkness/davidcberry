import { getCollection, type CollectionEntry } from 'astro:content';

/**
 * Every published post, newest first.
 *
 * Drafts are excluded from the list, the topic pages and the feed, but they
 * still build, so `npm run dev` renders them at their real URL while you work.
 * Nothing links to them until `draft` comes off.
 */
export async function getPublished(): Promise<CollectionEntry<'writing'>[]> {
  const posts = await getCollection('writing', ({ data }) => data.draft !== true);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}
