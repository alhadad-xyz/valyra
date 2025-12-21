# @valyra/ui

Valyra's design system and component library. A collection of reusable React components built with TypeScript, Tailwind CSS, and design tokens extracted from the landing page template.

## 📦 Installation

This package is part of the Valyra monorepo. To use it in other packages or apps:

```bash
# In your package.json
{
  "dependencies": {
    "@valyra/ui": "workspace:*"
  }
}
```

Then run:
```bash
pnpm install
```

## 🎨 Design Tokens

All design values are centralized in `src/styles/tokens.ts`:

- **Colors**: Primary (#f9f506), backgrounds, text colors, semantic colors
- **Spacing**: xs (4px) to 5xl (128px)
- **Typography**: Font families, sizes, weights, line heights
- **Border Radius**: sm (8px) to full (9999px)
- **Shadows**: sm to 2xl
- **Transitions**: Duration and timing functions

### Using Tokens

```tsx
import { tokens, colors, spacing } from '@valyra/ui';

// Direct usage
const style = {
  backgroundColor: colors.primary,
  padding: spacing.md,
  borderRadius: tokens.borderRadius.lg,
};
```

## 🧩 Components

### Button

A versatile button component with multiple variants and states.

```tsx
import { Button } from '@valyra/ui';

// Basic usage
<Button variant="primary">Click me</Button>

// With loading state
<Button loading>Processing...</Button>

// With icons
<Button leftIcon={<Icon />}>Continue</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `loading`: boolean
- `fullWidth`: boolean
- `leftIcon`, `rightIcon`: ReactNode
- All standard button HTML attributes

### Input

Form input component with label, error states, and icon support.

```tsx
import { Input } from '@valyra/ui';

// With label
<Input label="Email" type="email" placeholder="you@example.com" />

// With error
<Input 
  label="Password" 
  error="Password is required" 
  type="password" 
/>

// With icons
<Input leftIcon={<SearchIcon />} placeholder="Search..." />

// With helper text
<Input helperText="We'll never share your email" />
```

**Props:**
- `label`: string
- `error`: string
- `helperText`: string
- `leftIcon`, `rightIcon`: ReactNode
- `inputSize`: 'sm' | 'md' | 'lg'
- `fullWidth`: boolean
- All standard input HTML attributes

### Card

Container component for grouping content.

```tsx
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from '@valyra/ui';

// Basic card
<Card>
  <h3>Title</h3>
  <p>Content</p>
</Card>

// With sub-components
<Card>
  <CardHeader>
    <CardTitle>Project Name</CardTitle>
    <CardDescription>A brief description</CardDescription>
  </CardHeader>
  <CardContent>
    Main content here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Variants
<Card variant="elevated">Elevated card with shadow</Card>
<Card variant="outlined">Card with border</Card>
<Card hoverable>Hoverable card</Card>
```

**Props:**
- `variant`: 'default' | 'elevated' | 'outlined' | 'ghost'
- `padding`: 'none' | 'sm' | 'md' | 'lg' | 'xl'
- `hoverable`: boolean
- `header`, `footer`: ReactNode

### Badge

Small status indicator component.

```tsx
import { Badge } from '@valyra/ui';

// Variants
<Badge variant="primary">Primary</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="error">Error</Badge>

// With dot indicator
<Badge variant="success" dot>Online</Badge>

// With icon
<Badge icon={<StarIcon />}>Featured</Badge>

// Removable
<Badge onRemove={() => console.log('removed')}>Tag</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
<Badge size="lg">Large</Badge>
```

**Props:**
- `variant`: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'outline'
- `size`: 'sm' | 'md' | 'lg'
- `dot`: boolean
- `icon`: ReactNode
- `onRemove`: () => void

## 🎯 Usage in Apps

### In Next.js (apps/web)

```tsx
// app/page.tsx
import { Button, Card, Input } from '@valyra/ui';

export default function Page() {
  return (
    <Card>
      <Input label="Email" />
      <Button variant="primary">Submit</Button>
    </Card>
  );
}
```

### Tailwind Configuration

Make sure your app's `tailwind.config.js` includes the UI package:

```js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}', // Include UI package
  ],
  theme: {
    extend: {
      colors: {
        primary: '#f9f506',
        // ... other colors from tokens
      },
    },
  },
};
```

## 📝 Examples

See `src/examples.tsx` for comprehensive usage examples including:
- All button variants and states
- Form inputs with validation
- Card compositions
- Badge variations
- Complete form example
- Design token usage

## 🏗️ Development

```bash
# Install dependencies
pnpm install

# Type check
pnpm tsc --noEmit

# Build (if build script is configured)
pnpm build
```

## 🎨 Design System

This component library follows the design system from `template/landing-page.html`:

- **Primary Color**: Bright yellow (#f9f506) for CTAs and highlights
- **Typography**: Spline Sans for display text
- **Dark Mode**: Full support with dark variants
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Responsive**: Mobile-first design with responsive variants

## 📚 Related Issues

- [Issue #37](https://github.com/alhadad-xyz/valyra/issues/37) - Set up design tokens
- [Issue #38](https://github.com/alhadad-xyz/valyra/issues/38) - Create core components

## 🤝 Contributing

When adding new components:
1. Use design tokens from `src/styles/tokens.ts`
2. Implement variants using `class-variance-authority`
3. Add TypeScript types for all props
4. Include examples in `src/examples.tsx`
5. Export from `src/index.tsx`
6. Update this README

## 📄 License

MIT
