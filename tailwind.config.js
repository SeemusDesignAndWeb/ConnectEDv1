/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte}'],

	theme: {
		extend: {
			fontFamily: {
				sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
				serif: ['var(--font-serif)', 'Georgia', 'serif']
			},
			colors: {
				background: 'var(--color-background)',
				foreground: 'var(--color-foreground)',
				card: {
					DEFAULT: 'var(--color-card)',
					foreground: 'var(--color-card-foreground)'
				},
				primary: {
					DEFAULT: 'var(--color-primary)',
					foreground: 'var(--color-primary-foreground)'
				},
				secondary: {
					DEFAULT: 'var(--color-secondary)',
					foreground: 'var(--color-secondary-foreground)'
				},
				muted: {
					DEFAULT: 'var(--color-muted)',
					foreground: 'var(--color-muted-foreground)'
				},
				accent: {
					DEFAULT: 'var(--color-accent)',
					foreground: 'var(--color-accent-foreground)'
				},
				border: 'var(--color-border)',
				input: 'var(--color-input)',
				ring: 'var(--color-ring)',
				destructive: {
					DEFAULT: 'var(--color-destructive)',
					foreground: 'var(--color-destructive-foreground)'
				}
			},
			borderRadius: {
				DEFAULT: 'var(--radius)',
				lg: 'calc(var(--radius) + 4px)',
				md: 'calc(var(--radius) + 2px)',
				sm: 'calc(var(--radius) - 2px)'
			}
		}
	},

	plugins: []
};
