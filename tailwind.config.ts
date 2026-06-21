import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        cosmic: {
          deep: "hsl(var(--cosmic-deep))",
          midnight: "hsl(var(--cosmic-midnight))",
          nebula: "hsl(var(--cosmic-nebula))",
          aurora: "hsl(var(--cosmic-aurora))",
          rose: "hsl(var(--cosmic-rose))",
          gold: "hsl(var(--cosmic-gold))",
          silver: "hsl(var(--cosmic-silver))",
          glow: "hsl(var(--cosmic-glow))"
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'glow': {
          '0%, 100%': { 
            boxShadow: '0 0 20px hsl(var(--primary) / 0.3)',
            opacity: '1'
          },
          '50%': { 
            boxShadow: '0 0 40px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--secondary) / 0.3)',
            opacity: '0.9'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-slow': 'pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 4s ease-in-out infinite'
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        heading: ['Cormorant Garamond', 'serif'],
        display: ['Cormorant Garamond', 'serif']
      },
      backgroundImage: {
        'gradient-cosmic': 'linear-gradient(135deg, hsl(271 81% 56%) 0%, hsl(263 64% 94%) 50%, hsl(174 72% 36%) 100%)',
        'gradient-aurora': 'linear-gradient(135deg, hsl(271 81% 56%) 0%, hsl(174 72% 46%) 50%, hsl(174 72% 36%) 100%)',
        'gradient-rose': 'linear-gradient(135deg, hsl(271 81% 56%) 0%, hsl(43 80% 46%) 100%)',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
