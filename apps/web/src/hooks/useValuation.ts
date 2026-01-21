import { useQuery } from '@tanstack/react-query';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

interface ValuationRange {
    min: number;
    max: number;
}

interface ValuationData {
    valuation_range: ValuationRange;
    confidence: number;
    signature: string;
    attestation_message: string;
    warnings: string[];
}

interface ValuationRequest {
    revenue: number;
    growth_rate: number;
    industry?: string;
    description?: string;
}

export function useValuation(request: ValuationRequest, enabled: boolean = true) {
    return useQuery<ValuationData>({
        queryKey: ['valuation', request],
        queryFn: async () => {
            const response = await fetch(`${API_URL}/agent/valuation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch valuation');
            }

            return response.json();
        },
        enabled,
        retry: false,
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
}
