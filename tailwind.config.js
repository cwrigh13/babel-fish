/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // These match brandColors in constants/colors.js, making them available as Tailwind classes
        primaryTeal: '#00A99D',
        darkTeal: '#007A70',
        lightTealBackground: '#E0F2F1',
        accentRed: '#EB001B',
        lightRedBackground: '#FDE0DF',
        darkGreyText: '#333333',
        mediumGrey: '#6B7280',
        lightGreyBackground: '#F9FAFB',
        filterButtonActiveBlue: '#4285F4',
        filterButtonInactiveBg: '#F1F3F4',
        filterButtonInactiveText: '#3C4043',
        filterButtonHoverBg: '#E8EAED',
      },
      fontFamily: {
        sans: ['Work Sans', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem', // Actually, App.css has custom values for .rounded-2xl? No, standard is 1rem.
        'pill': '9999px',
      }
    },
  },
  plugins: [],
}
