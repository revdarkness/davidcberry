import rss from '@astrojs/rss';
import { getPublished } from '../lib/posts';
import { SITE } from '../consts';

export async function GET(context) {
  const posts = await getPublished();
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description ?? post.data.standfirst ?? '',
      pubDate: post.data.pubDate,
      link: `/${post.id}/`,
      categories: [post.data.topic],
    })),
    customData: '<language>en-us</language>',
  });
}
