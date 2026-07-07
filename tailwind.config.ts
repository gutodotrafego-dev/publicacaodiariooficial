import type { Config } from 'tailwindcss'
import { brandColors } from './lib/brand-colors'

// Cores oficiais da marca (imutáveis): vermelho #FF0302 e verde #058421.
// Tons "dark"/"light" são variações computadas para hover/fundos — ver lib/brand-colors.ts.
const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './config/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          red: brandColors.red,
          'red-dark': brandColors.redDark,
          'red-light': brandColors.redLight,
          green: brandColors.green,
          'green-dark': brandColors.greenDark,
          'green-light': brandColors.greenLight,
        },
        whatsapp: {
          DEFAULT: '#25D366',
          dark: '#128C4A',
        },
        surface: {
          50: '#FAFAFA',
          100: '#F4F4F5',
          200: '#E4E4E7',
        },
        ink: {
          900: '#18181B',
          700: '#3F3F46',
          500: '#71717A',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(24,24,27,0.06), 0 2px 8px rgba(24,24,27,0.06)',
        'card-hover': '0 4px 16px rgba(24,24,27,0.10)',
      },
      borderRadius: {
        xl: '14px',
      },
    },
  },
  plugins: [],
}

export default config
