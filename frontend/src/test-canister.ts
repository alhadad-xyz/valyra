// Direct test of canister integration
import { listingService } from './services/listingService';
import { CreateListingFormData } from './lib/validationSchemas';
import { BusinessStructure } from './types/backendTypes';

export const testCanisterDirectly = async () => {
  console.log('🧪 Starting direct canister test...');
  
  // Create minimal test data
  const testFormData: CreateListingFormData = {
    companyName: 'Test Company Direct',
    industry: 'Software/SaaS',
    businessDescription: 'A test company created via direct canister integration',
    location: 'San Francisco, CA',
    website: 'https://test-company.com',
    logo: 'https://test-company.com/logo.png',
    annualRevenue: 240000,
    monthlyRevenue: 20000,
    growthRate: 15,
    netProfit: 80000,
    grossMargin: 75,
    churnRate: 3,
    askingPrice: 1200000,
    customerAcquisitionCost: 200,
    lifetimeValue: 2500,
    customerBase: 'Small to medium businesses',
    employeeCount: 8,
    foundedYear: 2021,
    techStack: ['React', 'Node.js', 'PostgreSQL'],
    operatingExpenses: 160000,
    businessStructure: BusinessStructure.LLC,
    registeredAddress: '123 Test Street, San Francisco, CA 94101',
    taxId: '***-**-5678',
    gdprCompliant: true,
    dealStructure: 'Asset' as const,
    minimumInvestment: 100000,
    investmentTimeline: {
      start: new Date('2024-02-01'),
      end: new Date('2024-08-01')
    },
    documents: []
  };

  try {
    console.log('📤 Testing canister with data:', testFormData);
    const result = await listingService.createListing(testFormData);
    
    if (result.success) {
      console.log('✅ SUCCESS! Listing created with ID:', result.data);
      return result.data;
    } else {
      console.log('❌ FAILED:', result.error);
      return null;
    }
  } catch (error) {
    console.log('💥 EXCEPTION:', error);
    return null;
  }
};

// Make it globally available for testing in browser console
(window as any).testCanisterDirectly = testCanisterDirectly;