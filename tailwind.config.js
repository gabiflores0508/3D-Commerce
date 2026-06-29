/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#FAFAF7',
          soft: '#F4F4F0',
          card: '#FFFFFF',
        },
        ink: {
          DEFAULT: '#0F1115',
          soft: '#2A2D33',
          mute: '#6B7280',
          line: '#E5E7EB',
        },
        graphite: {
          DEFAULT: '#3A3F47',
          dark: '#1F2329',
        },
        accent: {
          DEFAULT: '#22D3EE',
          soft: '#67E8F9',
        },
        brand: {
          DEFAULT: '#0F1115',
          light: '#F4F4F0',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,17,21,0.04), 0 8px 24px rgba(15,17,21,0.06)',
        soft: '0 1px 2px rgba(15,17,21,0.04), 0 4px 14px rgba(15,17,21,0.05)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      backgroundImage: {
        'grid-soft': 'linear-gradient(to right, rgba(15,17,21,.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,17,21,.04) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
