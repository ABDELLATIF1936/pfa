/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00d9a3',
          foreground: '#ffffff',
          50: '#ecfdf5',
          100: '#d1fae5',
          300: '#55f0c2',
          400: '#00d9a3',
          500: '#00b889',
          600: '#009b76',
          700: '#007d63',
        },
        electric: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#4aa8ff',
          600: '#318be0',
          700: '#246fba',
        },
        brand: {
          dark: '#050b1d',
          slate: '#25324a',
          surface: '#f8fafc',
          blue: '#4aa8ff',
        },
        'dark-bg': '#050b1d',
        'dark-surface': '#111a2d',
        'client-dark-bg': '#050b1d',
        'client-dark-surface': '#182337',
        'client-dark-muted': '#25324a',
        'primary-gradient-start': '#00d9a3',
        'primary-gradient-end': '#4aa8ff',
        background: '#f8fafc',
        foreground: '#0f172a',
        card: '#ffffff',
        'card-foreground': '#0f172a',
        muted: '#f1f5f9',
        'muted-foreground': '#64748b',
        accent: '#dcfce7',
        'accent-foreground': '#166534',
        border: '#e2e8f0',
        input: '#cbd5e1',
        ring: '#00d9a3',
      },
    },
  },
  plugins: [],
}

