import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Static output is Astro's default and is all this site needs.
// No adapter: Cloudflare Pages serves ./dist directly, and an adapter would
// only be required for SSR or platform-specific features we deliberately avoid.
export default defineConfig({
  site: 'https://davidcberry.com',
  trailingSlash: 'always',
  integrations: [sitemap()],
  build: {
    // Emit /slug/index.html so URLs keep their trailing slash without a
    // redirect hop. Matches the trailingSlash setting above.
    format: 'directory',
  },
  markdown: {
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
});
