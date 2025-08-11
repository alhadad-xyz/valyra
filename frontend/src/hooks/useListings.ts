import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { DealListing } from '../components/ListingsTable';

export interface UseListingsOptions {
  refreshInterval?: number;
  autoRefresh?: boolean;
}

export interface UseListingsResult {
  listings: DealListing[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: Date | null;
}

export const useListings = ({
  refreshInterval = 5000,
  autoRefresh = true,
}: UseListingsOptions = {}): UseListingsResult => {
  const { identity } = useAuth();
  const [listings, setListings] = useState<DealListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchListings = useCallback(async () => {
    if (!identity) {
      setError('User not authenticated');
      setLoading(false);
      return;
    }

    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setError(null);
      
      // TODO: Replace with actual canister integration
      // For now, using mock data that simulates the DealNFT structure
      const mockListings: DealListing[] = [
        {
          id: 1,
          title: "AI-Powered SaaS Analytics Platform",
          company_name: "DataFlow Analytics",
          arr_usd: 1200000,
          mrr_usd: 100000,
          valuation_min: 8000000,
          valuation_max: 12000000,
          industry: "AI/Analytics",
          status: 'Active',
          created_at: Date.now() - 7 * 24 * 60 * 60 * 1000, // 7 days ago
          updated_at: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
          offers_count: 3,
          tech_stack: "Python, React, PostgreSQL, AWS",
          num_employees: 12,
        },
        {
          id: 2,
          title: "B2B Marketing Automation Tool",
          company_name: "MarketFlow Pro",
          arr_usd: 800000,
          mrr_usd: 67000,
          valuation_min: 5000000,
          valuation_max: 8000000,
          industry: "Marketing Tech",
          status: 'Under Negotiation',
          created_at: Date.now() - 14 * 24 * 60 * 60 * 1000, // 2 weeks ago
          updated_at: Date.now() - 2 * 60 * 60 * 1000, // 2 hours ago
          offers_count: 5,
          tech_stack: "Node.js, Vue.js, MongoDB, GCP",
          num_employees: 8,
        },
        {
          id: 3,
          title: "Cloud Infrastructure Management",
          company_name: "CloudOps Central",
          arr_usd: 2400000,
          mrr_usd: 200000,
          valuation_min: 15000000,
          valuation_max: 20000000,
          industry: "DevOps",
          status: 'Active',
          created_at: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
          updated_at: Date.now() - 3 * 60 * 60 * 1000, // 3 hours ago
          offers_count: 1,
          tech_stack: "Go, React, Docker, Kubernetes, AWS",
          num_employees: 25,
        },
        {
          id: 4,
          title: "E-commerce Platform for SMBs",
          company_name: "ShopEasy",
          arr_usd: 600000,
          mrr_usd: 50000,
          valuation_min: 3000000,
          valuation_max: 5000000,
          industry: "E-commerce",
          status: 'Draft',
          created_at: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
          updated_at: Date.now() - 1 * 60 * 60 * 1000, // 1 hour ago
          offers_count: 0,
          tech_stack: "PHP, MySQL, JavaScript",
          num_employees: 5,
        },
        {
          id: 5,
          title: "Fintech Payment Gateway",
          company_name: "PayConnect",
          arr_usd: 3600000,
          mrr_usd: 300000,
          valuation_min: 25000000,
          valuation_max: 35000000,
          industry: "Fintech",
          status: 'Sold',
          created_at: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30 days ago
          updated_at: Date.now() - 5 * 24 * 60 * 60 * 1000, // 5 days ago
          offers_count: 8,
          tech_stack: "Java, Spring, PostgreSQL, Redis",
          num_employees: 45,
        },
      ];

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      setListings(mockListings);
      setLastUpdated(new Date());
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err.message || 'Failed to fetch listings');
        console.error('Error fetching listings:', err);
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [identity]);

  // Initial fetch
  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    intervalRef.current = setInterval(fetchListings, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchListings, autoRefresh, refreshInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    listings,
    loading,
    error,
    refresh: fetchListings,
    lastUpdated,
  };
};

export default useListings;