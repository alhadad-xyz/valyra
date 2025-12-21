/**
 * Component Usage Examples
 * This file demonstrates how to use all components from the UI package
 */

import * as React from 'react';
import {
    Button,
    Input,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
    Badge,
    tokens,
} from './index';

// Example 1: Button Variants
export const ButtonExamples = () => (
    <div className="flex flex-col gap-4">
        <h2>Button Variants</h2>

        {/* Primary Button */}
        <Button variant="primary" size="md">
            Primary Button
        </Button>

        {/* Secondary Button */}
        <Button variant="secondary" size="md">
            Secondary Button
        </Button>

        {/* Ghost Button */}
        <Button variant="ghost" size="md">
            Ghost Button
        </Button>

        {/* Outline Button */}
        <Button variant="outline" size="md">
            Outline Button
        </Button>

        {/* Button with Loading State */}
        <Button variant="primary" loading>
            Loading...
        </Button>

        {/* Button with Icons */}
        <Button
            variant="primary"
            leftIcon={<span>🚀</span>}
        >
            With Left Icon
        </Button>

        {/* Different Sizes */}
        <div className="flex gap-2 items-center">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
        </div>

        {/* Full Width */}
        <Button fullWidth>Full Width Button</Button>
    </div>
);

// Example 2: Input Variants
export const InputExamples = () => (
    <div className="flex flex-col gap-4 max-w-md">
        <h2>Input Variants</h2>

        {/* Basic Input */}
        <Input placeholder="Enter your email" />

        {/* Input with Label */}
        <Input
            label="Email Address"
            placeholder="you@example.com"
            type="email"
        />

        {/* Input with Error */}
        <Input
            label="Password"
            type="password"
            error="Password must be at least 8 characters"
            placeholder="Enter password"
        />

        {/* Input with Helper Text */}
        <Input
            label="Username"
            placeholder="johndoe"
            helperText="Choose a unique username"
        />

        {/* Input with Icons */}
        <Input
            placeholder="Search..."
            leftIcon={<span>🔍</span>}
        />

        <Input
            placeholder="Enter amount"
            rightIcon={<span>💰</span>}
        />

        {/* Different Sizes */}
        <Input inputSize="sm" placeholder="Small input" />
        <Input inputSize="md" placeholder="Medium input" />
        <Input inputSize="lg" placeholder="Large input" />
    </div>
);

// Example 3: Card Variants
export const CardExamples = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <h2 className="col-span-full">Card Variants</h2>

        {/* Default Card */}
        <Card>
            <h3 className="font-bold mb-2">Default Card</h3>
            <p>This is a default card with border.</p>
        </Card>

        {/* Elevated Card */}
        <Card variant="elevated">
            <h3 className="font-bold mb-2">Elevated Card</h3>
            <p>This card has a shadow for elevation.</p>
        </Card>

        {/* Outlined Card */}
        <Card variant="outlined">
            <h3 className="font-bold mb-2">Outlined Card</h3>
            <p>This card has a thicker border.</p>
        </Card>

        {/* Hoverable Card */}
        <Card hoverable>
            <h3 className="font-bold mb-2">Hoverable Card</h3>
            <p>Hover over this card to see the effect.</p>
        </Card>

        {/* Card with Header and Footer */}
        <Card
            header={<h3 className="font-bold">Card Header</h3>}
            footer={<Button size="sm">Action</Button>}
        >
            <p>Card content goes here with header and footer.</p>
        </Card>

        {/* Card with Sub-components */}
        <Card>
            <CardHeader>
                <CardTitle>Project Title</CardTitle>
                <CardDescription>A brief description of the project</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Main content area with detailed information.</p>
            </CardContent>
            <CardFooter>
                <Button size="sm" variant="primary">View</Button>
                <Button size="sm" variant="secondary">Edit</Button>
            </CardFooter>
        </Card>
    </div>
);

// Example 4: Badge Variants
export const BadgeExamples = () => (
    <div className="flex flex-col gap-4">
        <h2>Badge Variants</h2>

        {/* Different Variants */}
        <div className="flex gap-2 flex-wrap">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="error">Error</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="outline">Outline</Badge>
        </div>

        {/* Different Sizes */}
        <div className="flex gap-2 items-center">
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
            <Badge size="lg">Large</Badge>
        </div>

        {/* With Dot Indicator */}
        <div className="flex gap-2">
            <Badge variant="success" dot>Online</Badge>
            <Badge variant="error" dot>Offline</Badge>
            <Badge variant="warning" dot>Away</Badge>
        </div>

        {/* With Icon */}
        <div className="flex gap-2">
            <Badge variant="primary" icon={<span>⭐</span>}>Featured</Badge>
            <Badge variant="success" icon={<span>✓</span>}>Verified</Badge>
        </div>

        {/* Removable */}
        <div className="flex gap-2">
            <Badge
                variant="neutral"
                onRemove={() => console.log('Remove clicked')}
            >
                Removable
            </Badge>
        </div>
    </div>
);

// Example 5: Complete Form Example
export const CompleteFormExample = () => {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => setLoading(false), 2000);
    };

    return (
        <Card variant="elevated" padding="lg" className="max-w-md mx-auto">
            <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>Enter your credentials to continue</CardDescription>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                        label="Email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        leftIcon={<span>📧</span>}
                        required
                    />

                    <Input
                        label="Password"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        leftIcon={<span>🔒</span>}
                        required
                    />

                    <Button
                        type="submit"
                        fullWidth
                        loading={loading}
                        variant="primary"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                </form>
            </CardContent>

            <CardFooter>
                <Badge variant="info" size="sm">
                    Secure Login
                </Badge>
            </CardFooter>
        </Card>
    );
};

// Example 6: Using Design Tokens
export const DesignTokensExample = () => (
    <div className="flex flex-col gap-4">
        <h2>Design Tokens Usage</h2>

        {/* Using color tokens */}
        <div
            style={{
                backgroundColor: tokens.colors.primary,
                color: tokens.colors.black,
                padding: tokens.spacing.md,
                borderRadius: tokens.borderRadius.DEFAULT,
            }}
        >
            Using design tokens directly
        </div>

        {/* Display color palette */}
        <div className="grid grid-cols-4 gap-2">
            <div className="h-20 rounded" style={{ backgroundColor: tokens.colors.primary }}>
                <span className="text-xs">Primary</span>
            </div>
            <div className="h-20 rounded" style={{ backgroundColor: tokens.colors.success }}>
                <span className="text-xs text-white">Success</span>
            </div>
            <div className="h-20 rounded" style={{ backgroundColor: tokens.colors.error }}>
                <span className="text-xs text-white">Error</span>
            </div>
            <div className="h-20 rounded" style={{ backgroundColor: tokens.colors.warning }}>
                <span className="text-xs">Warning</span>
            </div>
        </div>
    </div>
);

// Export all examples
export const AllExamples = () => (
    <div className="p-8 space-y-12">
        <ButtonExamples />
        <InputExamples />
        <CardExamples />
        <BadgeExamples />
        <CompleteFormExample />
        <DesignTokensExample />
    </div>
);
