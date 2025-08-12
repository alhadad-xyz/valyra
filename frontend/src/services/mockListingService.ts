// Mock listing service for local testing without Internet Computer backend
import { CreateListingFormData } from '../lib/validationSchemas';
import { ApiResponse } from '../types/backendTypes';

// Simple counter for mock IDs
let mockListingIdCounter = 1000;

/**
 * Mock version of createListing for local testing
 */
export const mockCreateListing = async (
  formData: CreateListingFormData,
  ipfsCid?: string
): Promise<ApiResponse<bigint>> => {
  console.log('🏪 Mock Listing Service: Creating listing with data:', {
    companyName: formData.companyName,
    industry: formData.industry,
    arr: formData.annualRevenue,
    mrr: formData.monthlyRevenue,
    askingPrice: formData.askingPrice,
    employeeCount: formData.employeeCount,
    ipfsCid,
    documentsCount: formData.documents?.length || 0
  });

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simulate random failure (10% chance)
  if (Math.random() < 0.1) {
    console.error('❌ Mock Listing Service: Simulated failure');
    return {
      success: false,
      error: 'Mock error: Simulated network failure. Please try again.'
    };
  }

  const mockListingId = BigInt(mockListingIdCounter++);
  
  console.log('✅ Mock Listing Service: Listing created successfully with ID:', mockListingId.toString());
  
  // Simulate storing the data (in a real app, this would go to the backend)
  const mockListingData = {
    id: mockListingId.toString(), // Convert BigInt to string for JSON storage
    companyName: formData.companyName,
    industry: formData.industry,
    arr: formData.annualRevenue,
    mrr: formData.monthlyRevenue,
    askingPrice: formData.askingPrice,
    ipfsCid,
    createdAt: new Date().toISOString(),
    status: 'Active'
  };
  
  // Store in localStorage for demo purposes (with BigInt serialization handling)
  try {
    const existingListings = JSON.parse(localStorage.getItem('mockListings') || '[]');
    existingListings.push(mockListingData);
    localStorage.setItem('mockListings', JSON.stringify(existingListings, (_key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));
    console.log('💾 Mock data stored in localStorage');
  } catch (storageError) {
    console.warn('⚠️ Could not store to localStorage:', storageError);
    // Continue without storing - the main functionality still works
  }

  return {
    success: true,
    data: mockListingId
  };
};

/**
 * Check if we should use mock listing service
 */
export const shouldUseMockListingService = (): boolean => {
  // Temporarily disable mock service to test real canister
  // const isLocal = import.meta.env.VITE_ENVIRONMENT === 'local';
  // return isLocal;
  return false;
};

/**
 * Get mock listings from localStorage for demo
 */
export const getMockListings = () => {
  return JSON.parse(localStorage.getItem('mockListings') || '[]');
};