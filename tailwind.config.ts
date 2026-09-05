import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4fb',
          100: '#d9e4f4',
          200: '#b3c8e9',
          300: '#7ea4d8',
          400: '#4a7dc4',
          500: '#2a5dab',
          600: '#1e4990',
          700: '#1B3A6B',
          800: '#162e56',
          900: '#0e1d37',
        },
        gold: {
          50: '#fdf9ec',
          100: '#f8edca',
          200: '#f0d98f',
          300: '#e8c454',
          400: '#d4a72c',
          500: '#B8962E',
          600: '#9a7a22',
          700: '#7c5f1b',
          800: '#5e4614',
          900: '#3d2d0c',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
