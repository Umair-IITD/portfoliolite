/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0A0F1E',
        card: '#111827',
        card2: '#1a2236',
        accent: '#3B82F6',
        teal: '#00D4B4',
        gold: '#F5A623',
        'text-primary': '#F1F5F9',
        'text-secondary': '#94A3B8',
        'text-muted': '#64748B',
      }
    },
  },
  plugins: [],
}