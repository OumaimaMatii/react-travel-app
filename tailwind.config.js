/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT: '#1B2B4B', dark: '#111d33' },
        secondary: { DEFAULT: '#E8803A', dark: '#c96b28' },
        surface:   '#F7F8FA',
        danger:    '#EF4444',
        success:   '#10B981',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:       '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 10px 25px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
