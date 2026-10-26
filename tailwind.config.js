/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        aicte: {
          navy: '#0B132B',
          dark: '#0F172A',
          blue: '#1D4ED8',
          accent: '#2563EB',
          light: '#F8FAFC',
          border: '#E2E8F0',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#EF4444',
          indigo: '#6366F1',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'gov': '0 4px 20px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 10px 25px -3px rgba(15, 23, 42, 0.12), 0 4px 6px -2px rgba(15, 23, 42, 0.05)',
      }
    },
  },
  plugins: [],
}
