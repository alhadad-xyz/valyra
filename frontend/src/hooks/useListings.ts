import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { DealListing } from '../components/ListingsTable';
import { listingService } from '../services/listingService';
import type { DealNFT } from '../declarations/listing_registry/listing_registry.did';

export interface UseListingsOptions {
  refreshInterval?: number;
  autoRefresh?: boolean;
  sellerOnly?: boolean; // New option to fetch only current seller's listings
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
  sellerOnly = false,
}: UseListingsOptions = {}): UseListingsResult => {
  const { identity } = useAuth();
  const [listings, setListings] = useState<DealListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const transformDealNFTToDealListing = (dealNFT: DealNFT): DealListing => {
    
    // Helper function to safely convert BigInt to number
    const safeNumberConvert = (value: any, fieldName: string): number => {
      try {
        if (value === null || value === undefined) {
          console.warn(`⚠️ ${fieldName} is null/undefined, defaulting to 0`);
          return 0;
        }
        
        // Handle BigInt
        if (typeof value === 'bigint') {
          return Number(value);
        }
        
        // Handle string representations of numbers
        if (typeof value === 'string') {
          const parsed = parseInt(value, 10);
          if (isNaN(parsed)) {
            console.warn(`⚠️ Failed to parse ${fieldName} string "${value}", defaulting to 0`);
            return 0;
          }
          return parsed;
        }
        
        // Handle regular numbers
        if (typeof value === 'number') {
          return value;
        }
        
        console.warn(`⚠️ Unexpected type for ${fieldName}:`, typeof value, value);
        return 0;
      } catch (error) {
        console.error(`💥 Error converting ${fieldName}:`, error, value);
        return 0;
      }
    };

    // Helper function to safely convert nanoseconds to milliseconds
    const safeTimestampConvert = (value: any, fieldName: string): number => {
      try {
        const numValue = safeNumberConvert(value, fieldName);
        return numValue > 0 ? numValue / 1_000_000 : Date.now(); // Default to now if invalid
      } catch (error) {
        console.error(`💥 Error converting timestamp ${fieldName}:`, error);
        return Date.now();
      }
    };

    // Map ListingStatus to DealListing status
    const getStatus = (backendStatus: any): DealListing['status'] => {
      try {
        
        // Handle both enum string and object format
        if (typeof backendStatus === 'string') {
          switch (backendStatus) {
            case 'Active': return 'Active';
            case 'Matched': return 'Under Negotiation';
            case 'Sold': return 'Sold';
            case 'Withdrawn': return 'Withdrawn';
            default: 
              console.warn(`⚠️ Unknown status string: ${backendStatus}`);
              return 'Active';
          }
        } else if (typeof backendStatus === 'object' && backendStatus !== null) {
          // Handle Rust enum object format { Active: null }
          if ('Active' in backendStatus) return 'Active';
          if ('Matched' in backendStatus) return 'Under Negotiation';
          if ('Sold' in backendStatus) return 'Sold';
          if ('Withdrawn' in backendStatus) return 'Withdrawn';
          
          console.warn(`⚠️ Unknown status object:`, backendStatus);
        }
        
        console.warn(`⚠️ Unexpected status type:`, typeof backendStatus, backendStatus);
        return 'Active'; // Default fallback
      } catch (error) {
        console.error(`💥 Error processing status:`, error);
        return 'Active';
      }
    };

    try {
      const result = {
        id: safeNumberConvert(dealNFT.id, 'id'),
        title: dealNFT.title || 'Untitled Listing',
        company_name: dealNFT.title || 'Unknown Company',
        arr_usd: safeNumberConvert(dealNFT.arr_usd, 'arr_usd'),
        mrr_usd: safeNumberConvert(dealNFT.mrr_usd, 'mrr_usd'),
        industry: (dealNFT.tech_stack || '').split(',')[0]?.trim() || 'Technology',
        status: getStatus(dealNFT.status),
        created_at: safeTimestampConvert(dealNFT.created_at, 'created_at'),
        updated_at: safeTimestampConvert(dealNFT.updated_at, 'updated_at'),
        offers_count: 0, // Will need to be fetched separately if available
        tech_stack: dealNFT.tech_stack || '',
        num_employees: safeNumberConvert(dealNFT.num_employees, 'num_employees'),
      };
      
      return result;
    } catch (error) {
      console.error('💥 Error in transformDealNFTToDealListing:', error);
      // Return a safe fallback object
      return {
        id: 0,
        title: 'Error Loading Listing',
        company_name: 'Unknown',
        arr_usd: 0,
        mrr_usd: 0,
        industry: 'Unknown',
        status: 'Active',
        created_at: Date.now(),
        updated_at: Date.now(),
        offers_count: 0,
        tech_stack: '',
        num_employees: 0,
      };
    }
  };

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
      
      console.log(`📡 Fetching listings from backend canister... ${sellerOnly ? '(seller only)' : '(all listings)'}`);
      const result = sellerOnly 
        ? await listingService.getListingsBySeller()
        : await listingService.getAllListings();
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (result.success) {
        console.log(`📦 Raw listing data from canister:`, result.data);
        
        if (result.data.length === 0) {
          console.log('📭 No listings found, showing empty state');
          setListings([]);
          setLastUpdated(new Date());
          return;
        }

        const transformedListings = result.data
          .map(transformDealNFTToDealListing)
          .filter(listing => listing.id !== 0); // Filter out failed transformations
          
        console.log(`✅ Successfully transformed ${transformedListings.length} of ${result.data.length} listings`);
        setListings(transformedListings);
        setLastUpdated(new Date());
      } else {
        console.error('❌ Failed to fetch listings:', result.error);
        
        // Temporary fallback to mock data while debugging the BigInt issue
        if (result.error.includes('BigInt') || result.error.includes('syntax')) {
          console.warn('🔧 BigInt parsing issue detected, falling back to mock data for debugging');
          
          const mockListings = [
            {
              id: 1,
              title: "AI-Powered Analytics Platform (Mock)",
              company_name: "DataFlow Analytics",
              arr_usd: 1200000,
              mrr_usd: 100000,
              industry: "AI/Analytics",
              status: 'Active' as const,
              created_at: Date.now() - 7 * 24 * 60 * 60 * 1000,
              updated_at: Date.now() - 1 * 24 * 60 * 60 * 1000,
              offers_count: 3,
              tech_stack: "Python, React, PostgreSQL, AWS",
              num_employees: 12,
            },
            {
              id: 2,
              title: "B2B Marketing Tool (Mock)",
              company_name: "MarketFlow Pro", 
              arr_usd: 800000,
              mrr_usd: 67000,
              industry: "Marketing Tech",
              status: 'Under Negotiation' as const,
              created_at: Date.now() - 14 * 24 * 60 * 60 * 1000,
              updated_at: Date.now() - 2 * 60 * 60 * 1000,
              offers_count: 5,
              tech_stack: "Node.js, Vue.js, MongoDB, GCP",
              num_employees: 8,
            }
          ];
          
          setListings(mockListings);
          setLastUpdated(new Date());
          setError('Using mock data - BigInt parsing issue with canister (development mode)');
          return;
        }
        
        // Check if this might be a canister not running issue  
        if (result.error.includes('Connection') || result.error.includes('network') || result.error.includes('fetch')) {
          setError('Unable to connect to the backend canister. Please ensure the canister is running locally.');
        } else {
          setError(result.error);
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        const errorMessage = err.message || 'Failed to fetch listings';
        console.error('💥 Exception fetching listings:', err);
        
        // Provide more helpful error messages for common issues
        if (errorMessage.includes('BigInt')) {
          setError('Data format error: Unable to parse numeric values from the canister.');
        } else if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
          setError('Network error: Cannot connect to the backend canister. Please ensure it is running.');
        } else {
          setError(errorMessage);
        }
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [identity, sellerOnly]);

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