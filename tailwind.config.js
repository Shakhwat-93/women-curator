/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        curator: {
          bg: '#FAF5EE',           // Warm cream canvas
          'bg-warm': '#F6EFE6',      // Warm beige cream
          surface: '#FDFBF7',      // Soft off-white surface
          'surface-peach': '#F9EDE5', // Soft peach surface
          'surface-blush': '#FCEEE8', // Soft blush surface
          coral: '#DE4F3C',        // Signature Coral / warm red-orange
          'coral-hover': '#C83F2D', // Deep Coral
          'coral-light': '#FDEAE6', // Coral tint background
          blush: '#F4A999',        // Soft blush pink
          'blush-soft': '#FAD5CD',  // Very soft blush
          rose: '#BD4857',         // Muted luxury rose
          charcoal: '#201C1A',     // Deep charcoal
          'charcoal-light': '#3D3734',
          muted: '#7A706A',        // Warm gray
          'muted-light': '#A69E98',
          border: '#EFE5DC',       // Soft warm border
          'border-coral': 'rgba(222, 79, 60, 0.18)',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', '"DM Serif Display"', 'Georgia', 'serif'],
        display: ['"DM Serif Display"', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        script: ['"Alex Brush"', '"Playball"', '"Caveat"', 'cursive'],
        mono: ['"JetBrains Mono"', '"DM Mono"', 'monospace'],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        'card': '1.75rem',
      },
      boxShadow: {
        'curator-sm': '0 2px 8px -2px rgba(32, 28, 26, 0.05)',
        'curator': '0 10px 30px -10px rgba(222, 79, 60, 0.08), 0 4px 12px -2px rgba(32, 28, 26, 0.04)',
        'curator-lg': '0 20px 40px -15px rgba(222, 79, 60, 0.12), 0 10px 20px -5px rgba(32, 28, 26, 0.05)',
        'curator-glow': '0 0 25px rgba(222, 79, 60, 0.25)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.8 },
        }
      },
      animation: {
        'float-slow': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
