/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Hanken Grotesk']
      },
      fontSize: {
        title: ['20px', { lineHeight: '130%' }],
        'title-bold': ['20px', { lineHeight: '130%', fontWeight: 'bold' }],
        small: ['14px', { lineHeight: '160%' }],
        'small-bold': ['14px', { lineHeight: '160%', fontWeight: 'bold' }],
        caption: ['12px', { lineHeight: '20px' }],
        'tiny-bold': ['12px', { lineHeight: '20px', fontWeight: 'bold' }],
        overline: ['10px', { lineHeight: '16px', letterSpacing: '0.08em' }],
        'overline-bold': [
          '10px',
          { lineHeight: '16px', fontWeight: 'bold', letterSpacing: '0.08em' }
        ],
        button: ['16px', { lineHeight: '24px', letterSpacing: '0.01em' }],
        'button-bold': ['14px', { lineHeight: '22px', fontWeight: 'bold', letterSpacing: '0.01em' }]
      },
      fontWeight: {
        bold: '700'
      },

      colors: {
        black: {
          DEFAULT: '#171717'
        },
        'yellow-bee': {
          800: '#664400',
          600: '#996600',
          400: '#cc8800',
          300: '#fdb933',
          200: '#fec048',
          100: '#ffe4ad',
          50: '#fff5e0'
        },
        'oceanic-blue': {
          800: '#094652',
          600: '#0c5b6e',
          400: '#137790',
          200: '#45abc4',
          100: '#b4e5ee',
          50: '#def3f8'
        },
        'purple-sunset': {
          800: '#29204b',
          600: '#422e94',
          400: '#6245d9',
          200: '#8b74e7',
          100: '#cec2ff',
          50: '#ebe5ff'
        },
        neutral: {
          900: '#18262b',
          800: '#313e42',
          700: '#4d585c',
          600: '#677073',
          500: '#828a8d',
          400: '#acb1b3',
          300: '#c5c9ca',
          200: '#edeeee',
          100: '#f6f6f7',
          '000': '#ffffff'
        },
        red: {
          800: '#7a1000',
          400: '#eb1f00',
          200: '#ff6952',
          100: '#ffb8ad',
          50: '#ffe9e6'
        },
        orange: {
          800: '#612d00',
          400: '#b75500',
          200: '#ff9a42',
          150: '#F9E1B3',
          100: '#ffca9b',
          50: '#fff0e3'
        },
        green: {
          800: '#19311e',
          400: '#00a91c',
          200: '#7fdd89',
          100: '#b7f5bd',
          50: '#e3f5e1'
        }
      }
    }
  },
  plugins: []
}
