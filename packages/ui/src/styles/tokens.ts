/**
 * Design Tokens
 * Single source of truth for design system values
 * Updated to Base Blue color scheme per design-spec.md
 */

// Color Palette
export const colors = {
    // Primary brand color - Base Blue
    primary: '#0052FF',
    'primary-light': '#3374FF',
    'primary-dark': '#0041CC',

    // Accent colors
    success: '#10B981', // Money Green
    warning: '#F59E0B', // Warning Yellow
    error: '#EF4444',   // Alert Red
    info: '#3B82F6',

    // Background colors
    background: {
        light: '#FFFFFF',
        dark: '#111827',
        'light-secondary': '#F9FAFB',
        'dark-elevated': '#1F2937',
    },

    // Text colors
    text: {
        main: '#111827',
        muted: '#6B7280', // Fee Gray
        inverse: '#ffffff',
    },

    // Neutral grays
    gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
    },

    // Transparent
    transparent: 'transparent',
    white: '#ffffff',
    black: '#000000',
} as const;

// Spacing Scale
export const spacing = {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px
    '5xl': '8rem',    // 128px
} as const;

// Typography
export const typography = {
    fontFamily: {
        display: ['Spline Sans', 'sans-serif'],
        sans: ['Spline Sans', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
    },

    fontSize: {
        xs: '0.75rem',      // 12px
        sm: '0.875rem',     // 14px
        base: '1rem',       // 16px
        lg: '1.125rem',     // 18px
        xl: '1.25rem',      // 20px
        '2xl': '1.5rem',    // 24px
        '3xl': '1.875rem',  // 30px
        '4xl': '2.25rem',   // 36px
        '5xl': '3rem',      // 48px
        '6xl': '3.75rem',   // 60px
    },

    fontWeight: {
        light: '300',
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
        black: '900',
    },

    lineHeight: {
        none: '1',
        tight: '1.1',
        snug: '1.375',
        normal: '1.5',
        relaxed: '1.625',
        loose: '2',
    },

    letterSpacing: {
        tighter: '-0.05em',
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
        wider: '0.05em',
        widest: '0.1em',
    },
} as const;

// Border Radius
export const borderRadius = {
    none: '0',
    sm: '0.5rem',     // 8px (per design spec)
    DEFAULT: '0.5rem',  // 8px (per design spec)
    lg: '0.75rem',    // 12px (per design spec)
    xl: '1rem',       // 16px (per design spec)
    full: '9999px',
} as const;

// Shadows
export const shadows = {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
} as const;

// Z-index scale
export const zIndex = {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modal: 1300,
    popover: 1400,
    tooltip: 1500,
} as const;

// Transition durations
export const transitions = {
    duration: {
        fast: '150ms',
        base: '200ms',
        slow: '300ms',
        slower: '500ms',
    },
    timing: {
        ease: 'ease',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out',
        linear: 'linear',
    },
} as const;

// Breakpoints (for reference, Tailwind handles these)
export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
} as const;

// Generate CSS variables from tokens
export const generateCSSVariables = () => {
    const cssVars: Record<string, string> = {};

    // Colors
    Object.entries(colors).forEach(([key, value]) => {
        if (typeof value === 'string') {
            cssVars[`--color-${key}`] = value;
        } else if (typeof value === 'object') {
            Object.entries(value).forEach(([subKey, subValue]) => {
                cssVars[`--color-${key}-${subKey}`] = subValue;
            });
        }
    });

    // Spacing
    Object.entries(spacing).forEach(([key, value]) => {
        cssVars[`--spacing-${key}`] = value;
    });

    // Shadows
    Object.entries(shadows).forEach(([key, value]) => {
        cssVars[`--shadow-${key}`] = value;
    });

    return cssVars;
};

// Export all tokens as a single object
export const tokens = {
    colors,
    spacing,
    typography,
    borderRadius,
    shadows,
    zIndex,
    transitions,
    breakpoints,
} as const;

export default tokens;
