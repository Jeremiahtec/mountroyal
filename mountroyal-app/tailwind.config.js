/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        appBg: '#F8FAFC', 
        brandNavy: '#0F172A', 
        brandGreen: '#15803D', 
        cardWhite: '#FFFFFF',
        statusPaid: '#DCFCE7', 
        statusPaidText: '#166534', 
        statusDue: '#FFEDD5', 
        statusDueText: '#9A3412', 
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)', 
      }
    },
  },
  plugins: [],
}