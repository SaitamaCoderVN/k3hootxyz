import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FACC15', // Yellow-400
        'primary-dark': '#EAB308', // Yellow-600
      },
      fontFamily: {
        sans: ['var(--font-plex-mono)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-plex-mono)', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #e879f9, #f472b6)',
      },
    },
  },
  plugins: [],
}

export default config 