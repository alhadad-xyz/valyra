import { AuthGuard } from '@/components/AuthGuard';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <AuthGuard>{children}</AuthGuard>;
}
