import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()]
  },

  // GitHub Pages configuration
  site: process.env.GITHUB_ACTIONS 
    ? 'https://penkin-repo.github.io' 
    : 'http://localhost:4321',
  base: process.env.GITHUB_ACTIONS 
    ? '/phrasesnap/' 
    : '/'
});