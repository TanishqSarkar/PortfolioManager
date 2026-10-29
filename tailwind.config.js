/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#0a0e14',
          900: '#0d1119',
          800: '#121826',
          700: '#1a2234',
          600: '#232d42',
        },
        navy: {
          900: '#0f1726',
          800: '#141d30',
          700: '#1c273d',
        },
        profit: {
          DEFAULT: '#3fb97f',
          dim: '#2d8a5f',
          bg: 'rgba(63,185,127,0.1)',
        },
        loss: {
          DEFAULT: '#e5584f',
          dim: '#b4443d',
          bg: 'rgba(229,88,79,0.1)',
        },
        accent: {
          DEFAULT: '#4f8cff',
          dim: '#3a6bd6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}
