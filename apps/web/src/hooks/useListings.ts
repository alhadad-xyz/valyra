import { useQuery } from '@tanstack/react-query';
import { useUser } from './useUser';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface Listing {
    id: string;
    asset_name: string;
    asking_price: number;
    status: 'active' | 'sold' | 'draft' | 'paused';
    asset_type: string;
    seller_address?: string;
    // ... other fields
}

export function useMyListings() {
    const { data: user } = useUser();

    const fetchListings = async (): Promise<Listing[]> => {
        if (!user?.id) return [];

        const response = await fetch(`${API_URL}/listings?seller_id=${user.id}`);
        if (!response.ok) throw new Error('Failed to fetch listings');
        return response.json();
    };

    return useQuery({
        queryKey: ['my-listings', user?.id],
        queryFn: fetchListings,
        enabled: !!user?.id,
    });
}
