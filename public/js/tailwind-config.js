/**
 * ACCESS GATE SYSTEM - Shared Tailwind Configuration
 *
 * This file provides a unified Tailwind config for all pages
 * with extended breakpoints for responsive design
 */

window.sharedTailwindConfig = {
    darkMode: "class",
    theme: {
        // Extended screens for all device sizes
        screens: {
            'xs': '480px',      // Large phones
            'sm': '640px',      // Small tablets
            'md': '768px',      // Tablets
            'lg': '1024px',     // Small laptops
            'xl': '1280px',     // Laptops/Desktops
            '2xl': '1536px',    // Large desktops
            '3xl': '1920px',    // Full HD / 23+ inch monitors
            '4xl': '2560px',    // 2K / Ultra-wide monitors
        },
        extend: {
            // Brand colors
            colors: {
                "primary": "#e63223",
                "primary-dark": "#c92a1d",
                "primary-light": "#ff4d3d",
                "background-light": "#fbf8f7",
                "background-dark": "#1f1a19",
                "text-primary-light": "#2d2422",
                "text-secondary-light": "#5c5250",
                "text-primary-dark": "#fdfcfc",
                "text-secondary-dark": "#a89f9d",
                "text-main": "#2d2422",
                "text-sub": "#5c5250",
                "border-color": "#e8e2e0",
            },
            // Font families
            fontFamily: {
                "display": ["Inter", "Noto Sans", "sans-serif"],
                "body": ["Inter", "Noto Sans", "sans-serif"],
            },
            // Border radius
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "2xl": "1rem",
                "3xl": "1.5rem",
                "full": "9999px"
            },
            // Spacing for large screens
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
                '30': '7.5rem',
                '128': '32rem',
                '144': '36rem',
            },
            // Font sizes for large screens
            fontSize: {
                '2xs': ['0.625rem', { lineHeight: '0.75rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
                '5xl': ['3rem', { lineHeight: '1.16' }],
                '6xl': ['3.75rem', { lineHeight: '1.1' }],
            },
            // Max widths for containers
            maxWidth: {
                '8xl': '88rem',      // 1408px
                '9xl': '96rem',      // 1536px
                '10xl': '112.5rem',  // 1800px
            },
            // Min heights
            minHeight: {
                'screen-90': '90vh',
                'screen-80': '80vh',
            },
            // Z-index
            zIndex: {
                '60': '60',
                '70': '70',
                '80': '80',
                '90': '90',
                '100': '100',
            },
            // Animation
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
            },
        },
    },
};

// Auto-apply config if Tailwind is loaded
if (typeof tailwind !== 'undefined') {
    tailwind.config = window.sharedTailwindConfig;
}
