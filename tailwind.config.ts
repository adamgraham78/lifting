import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Utilitarian fitness aesthetic - dark with strong accents
        background: {
          DEFAULT: '#0a0a0a',
          secondary: '#171717',
          tertiary: '#262626',
        },
        foreground: {
          DEFAULT: '#fafafa',
          secondary: '#a3a3a3',
          tertiary: '#737373',
        },
        accent: {
          DEFAULT: '#ea580c', // Strong orange for intensity
          hover: '#c2410c',
          light: '#fb923c',
        },
        success: '#22c55e',
        warning: '#eab308',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Impact', 'Haettenschweiler', 'Franklin Gothic Bold', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
