/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        mrkoon: {
          DEFAULT: '#0f4c81',
          dark: '#0a3a64',
          light: '#3a8dd6',
          accent: '#f5a524',
        },
        ok: '#16a34a',
        warn: '#f59e0b',
        bad: '#dc2626',
      },
      fontFamily: {
        sans: ['Inter', 'Cairo', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
