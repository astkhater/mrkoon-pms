/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Mrkoon brand v1 (per shared/creative/brand-assets/mrkoon-brand-guidelines-v1)
        mrkoon: {
          DEFAULT: '#1A2B3D',  // Mrkoon Navy — primary background, headers
          dark:    '#111E2B',  // Deep Navy — footer / darkest sections
          light:   '#243447',  // Light Navy — secondary dark backgrounds
          accent:  '#42B564',  // Mrkoon Green — CTAs, accent
        },
        'mrkoon-green': {
          DEFAULT: '#42B564',  // primary green
          soft:    '#5EC87A',  // hover
          tint:    '#D4F5DE',  // bg tag
        },
        'mrkoon-grey': {
          mid:   '#8A9BA8',
          light: '#F0F4F7',
        },
        ok:   '#42B564',  // align with brand green
        warn: '#f59e0b',
        bad:  '#dc2626',
      },
      fontFamily: {
        // EN headlines — geometric sans-serif (Montserrat). AR — Almarai (rounded clean).
        sans:  ['Montserrat', 'Almarai', 'system-ui', 'sans-serif'],
        ar:    ['Almarai', 'Tajawal', 'Cairo', 'system-ui', 'sans-serif'],
        en:    ['Montserrat', 'Poppins', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
