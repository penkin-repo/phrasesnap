/// <reference types="astro/client" />

declare module 'astro:transitions/client' {
  export const navigate: (url: string) => void;
  export const supportsViewTransitions: boolean;
}

declare namespace astroHTML.JSX {
  interface HTMLAttributes {
    'is:global'?: boolean;
  }
}

declare global {
  interface ImportMeta {
    env: {
      [key: string]: string;
    };
  }
}