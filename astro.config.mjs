// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://abhiprasad.github.io',
  output: 'static',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('404'),
    }),
  ],
});
