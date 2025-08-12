import { HttpAgent, Identity } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { Principal } from '@dfinity/principal';
import { 
  ApiResponse,
  CanisterResult 
} from '../types/backendTypes';
import { CreateListingFormData } from '../lib/validationSchemas';

// Use generated declarations instead of manual IDL
import { createActor } from '../declarations/listing_registry';
import type { 
  _SERVICE as ListingRegistryService,
  DealNFT as GeneratedDealNFT,
  CreateDealRequest as GeneratedCreateDealRequest,
  UpdateDealRequest as GeneratedUpdateDealRequest,
  BusinessStructure as GeneratedBusinessStructure
} from '../declarations/listing_registry/listing_registry.did';

// Canister configuration
const LISTING_REGISTRY_CANISTER_ID = import.meta.env.VITE_LISTING_REGISTRY_CANISTER_ID || 'uzt4z-lp777-77774-qaabq-cai';
const IC_HOST = import.meta.env.VITE_IC_HOST || 'http://localhost:4943';
const IS_LOCAL = import.meta.env.VITE_ENVIRONMENT === 'local' || import.meta.env.VITE_ENVIRONMENT === 'development';

console.log('🔧 Service Configuration:', {
  LISTING_REGISTRY_CANISTER_ID,
  IC_HOST,
  IS_LOCAL,
  env: import.meta.env.VITE_ENVIRONMENT
});

// Type aliases for compatibility with existing code
type DealNFT = GeneratedDealNFT;
type CreateDealRequest = GeneratedCreateDealRequest;
type UpdateDealRequest = GeneratedUpdateDealRequest;

// Service class for listing operations
export class ListingService {
  private actor: ListingRegistryService | null = null;
  private authClient: AuthClient | null = null;
  private currentIdentity: Identity | null = null;

  /**
   * Initialize the service with authentication
   */
  async initialize(identity?: Identity): Promise<void> {
    try {
      console.log('🚀 Initializing ListingService with config:', {
        IC_HOST,
        LISTING_REGISTRY_CANISTER_ID,
        IS_LOCAL
      });

      // Use provided identity or create new AuthClient if none provided
      if (identity) {
        console.log('✅ Using provided identity');
        this.currentIdentity = identity;
      } else {
        this.authClient = await AuthClient.create();
        identity = this.authClient.getIdentity();
        this.currentIdentity = identity;
        console.log('✅ AuthClient created and identity extracted');
      }
      
      const agent = new HttpAgent({ 
        host: IC_HOST,
        identity,
      });

      // Fetch root key for local development
      if (IS_LOCAL) {
        console.log('🔧 Fetching root key for local development');
        await agent.fetchRootKey();
        console.log('✅ Root key fetched successfully');
      }

      console.log('🔧 Creating actor with generated factory...');
      this.actor = createActor(LISTING_REGISTRY_CANISTER_ID, {
        agent,
      }) as ListingRegistryService;
      
      console.log('✅ Actor created successfully');
      console.log('🔍 Actor has list_ids method:', typeof this.actor?.list_ids);
      
      // Test the canister connection
      try {
        console.log('🧪 Testing canister connection...');
        // Don't actually call it here, just verify the method exists
        if (!this.actor || typeof this.actor.list_ids !== 'function') {
          throw new Error('list_ids method not found on actor');
        }
        console.log('✅ Canister connection test passed');
      } catch (testError) {
        console.error('❌ Canister connection test failed:', testError);
        throw new Error(`Canister connection failed: ${testError}`);
      }
      
    } catch (error) {
      console.error('❌ Failed to initialize listing service:', error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    if (!this.authClient) {
      await this.initialize();
    }
    return await this.authClient!.isAuthenticated();
  }

  /**
   * Transform form data to canister request format
   */
  private transformFormDataToRequest(formData: CreateListingFormData, ipfsCid?: string): CreateDealRequest {
    return {
      title: formData.companyName,
      description: `${formData.businessDescription}\n\nIndustry: ${formData.industry}\nFounded: ${formData.foundedYear}`,
      website_url: formData.website,
      logo_url: formData.logo || '',
      arr_usd: BigInt(formData.annualRevenue),
      mrr_usd: BigInt(formData.monthlyRevenue),
      churn_pct: formData.churnRate,
      gross_margin_pct: formData.grossMargin,
      net_profit_usd: BigInt(Math.max(0, formData.netProfit)), // Ensure non-negative
      cac_usd: formData.customerAcquisitionCost,
      ltv_usd: formData.lifetimeValue,
      tech_stack: formData.techStack.join(', '),
      num_employees: formData.employeeCount,
      customer_base: formData.customerBase,
      annual_operating_expenses_usd: BigInt(formData.operatingExpenses),
      business_structure: { [formData.businessStructure]: null } as GeneratedBusinessStructure,
      registered_address: formData.registeredAddress,
      tax_id: formData.taxId,
      gdpr_compliant: formData.gdprCompliant,
      attachments_cid: ipfsCid ? [ipfsCid] : [], // Generated type uses array format
    };
  }

  /**
   * Create a new listing
   */
  async createListing(formData: CreateListingFormData, ipfsCid?: string): Promise<ApiResponse<bigint>> {
    try {
      console.log('🚀 ListingService Config:', {
        LISTING_REGISTRY_CANISTER_ID,
        IC_HOST,
        IS_LOCAL,
        hasActor: !!this.actor
      });

      if (!this.actor) {
        await this.initialize(this.currentIdentity || undefined);
      }

      const isAuth = await this.isAuthenticated();
      console.log('🔐 Authentication status:', isAuth);
      
      if (!isAuth) {
        return {
          success: false,
          error: 'User not authenticated. Please log in first.'
        };
      }

      const request = this.transformFormDataToRequest(formData, ipfsCid);
      console.log('Creating listing with request:', request);

      if (!this.actor) {
        throw new Error('Actor not initialized');
      }

      console.log('📤 Sending request to canister:', request);
      console.log('🔍 Request JSON:', JSON.stringify(request, (_, value) => 
        typeof value === 'bigint' ? value.toString() : value, 2));
      
      const result: CanisterResult<bigint> = await this.actor.create_deal(request);
      console.log('📥 Received response from canister:', result);

      if ('Ok' in result) {
        console.log('✅ Listing created successfully with ID:', result.Ok);
        return {
          success: true,
          data: result.Ok
        };
      } else {
        console.error('❌ Canister returned error:', result.Err);
        return {
          success: false,
          error: result.Err
        };
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create listing'
      };
    }
  }

  /**
   * Get a single listing by ID
   */
  async getListing(id: bigint): Promise<ApiResponse<DealNFT>> {
    try {
      if (!this.actor) {
        await this.initialize(this.currentIdentity || undefined);
      }

      if (!this.actor) {
        throw new Error('Actor not initialized');
      }

      console.log(`📡 Fetching individual listing with ID: ${id} (type: ${typeof id})`);
      const result: CanisterResult<DealNFT> = await this.actor.get_deal(id);
      console.log(`📥 Raw result for listing ${id}:`, result);
      
      if ('Ok' in result) {
        console.log(`🔍 DealNFT data types for listing ${id}:`, {
          id: { value: result.Ok.id, type: typeof result.Ok.id },
          arr_usd: { value: result.Ok.arr_usd, type: typeof result.Ok.arr_usd },
          mrr_usd: { value: result.Ok.mrr_usd, type: typeof result.Ok.mrr_usd },
          created_at: { value: result.Ok.created_at, type: typeof result.Ok.created_at },
          updated_at: { value: result.Ok.updated_at, type: typeof result.Ok.updated_at }
        });
      }

      if ('Ok' in result) {
        console.log(`✅ Successfully fetched listing ${id}:`, result.Ok);
        return {
          success: true,
          data: result.Ok
        };
      } else {
        console.error(`❌ Canister returned error for listing ${id}:`, result.Err);
        return {
          success: false,
          error: result.Err
        };
      }
    } catch (error) {
      console.error(`💥 Exception fetching listing ${id}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch listing'
      };
    }
  }

  /**
   * Get all listing IDs
   */
  async getAllListingIds(): Promise<ApiResponse<bigint[]>> {
    try {
      if (!this.actor) {
        console.log('🔧 Actor not initialized, initializing...');
        await this.initialize();
      }

      console.log('📡 Calling list_ids() on canister...');
      
      if (!this.actor) {
        throw new Error('Actor not initialized after initialize call');
      }

      // Try to call the method with error handling
      let rawResult;
      try {
        rawResult = await this.actor.list_ids();
        console.log('✅ Retrieved listing IDs:', rawResult);
      } catch (actorError) {
        console.error('❌ Error calling list_ids():', actorError);
        throw actorError;
      }

      // Handle the result - the generated type is BigUint64Array | bigint[]
      let ids: bigint[];
      if (rawResult instanceof BigUint64Array) {
        ids = Array.from(rawResult, (item) => BigInt(item));
      } else if (Array.isArray(rawResult)) {
        ids = rawResult.map((item, index) => {
          if (typeof item === 'bigint') {
            return item;
          } else if (typeof item === 'number') {
            return BigInt(item);
          } else if (typeof item === 'string') {
            return BigInt(item);
          } else {
            console.warn(`⚠️ Unexpected item type at index ${index}:`, typeof item, item);
            return BigInt(item);
          }
        });
      } else {
        console.error('❌ Response is not an array or BigUint64Array:', rawResult);
        throw new Error('Expected array or BigUint64Array response from list_ids()');
      }
      
      console.log(`✅ Successfully processed ${ids.length} listing IDs`);
      
      return {
        success: true,
        data: ids
      };
    } catch (error) {
      console.error('❌ Exception in getAllListingIds:', error);
      console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack available');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch listings'
      };
    }
  }

  /**
   * Get all listings (fetches IDs then individual listings)
   */
  async getAllListings(): Promise<ApiResponse<DealNFT[]>> {
    try {
      console.log('📡 Starting getAllListings process...');
      const idsResult = await this.getAllListingIds();
      
      if (!idsResult.success) {
        console.error('❌ Failed to get listing IDs:', idsResult.error);
        return idsResult as ApiResponse<DealNFT[]>;
      }

      console.log(`📊 Found ${idsResult.data.length} listing IDs`);

      // Handle empty listings case
      if (idsResult.data.length === 0) {
        console.log('📭 No listings found in canister');
        return {
          success: true,
          data: []
        };
      }

      const listings: DealNFT[] = [];
      const errors: string[] = [];

      // Fetch listings in parallel with concurrency limit
      const MAX_CONCURRENT = 5;
      const ids = idsResult.data;
      
      console.log(`🔄 Processing ${ids.length} listings in batches of ${MAX_CONCURRENT}...`);
      
      for (let i = 0; i < ids.length; i += MAX_CONCURRENT) {
        const batch = ids.slice(i, i + MAX_CONCURRENT);
        console.log(`📦 Processing batch ${Math.floor(i/MAX_CONCURRENT) + 1}: IDs [${batch.map(id => id.toString()).join(', ')}]`);
        
        const promises = batch.map(id => this.getListing(id));
        const results = await Promise.all(promises);

        results.forEach((result, index) => {
          if (result.success) {
            console.log(`✅ Successfully processed listing ${batch[index]}`);
            listings.push(result.data);
          } else {
            const error = `Failed to fetch listing ${batch[index]}: ${result.error}`;
            console.error(`❌ ${error}`);
            errors.push(error);
          }
        });
      }

      if (errors.length > 0) {
        console.warn(`⚠️ ${errors.length} listings failed to fetch:`, errors);
      }

      console.log(`✅ Successfully fetched ${listings.length} of ${ids.length} listings`);

      return {
        success: true,
        data: listings
      };
    } catch (error) {
      console.error('💥 Exception in getAllListings:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch listings'
      };
    }
  }

  /**
   * Get all listings for a specific seller
   */
  async getListingsBySeller(sellerPrincipal?: Principal): Promise<ApiResponse<DealNFT[]>> {
    try {
      if (!this.actor) {
        await this.initialize(this.currentIdentity || undefined);
      }

      if (!this.actor) {
        throw new Error('Actor not initialized');
      }

      // Use current user's principal if not provided
      const principal = sellerPrincipal || await this.getCurrentUserPrincipal();
      
      if (!principal) {
        return {
          success: false,
          error: 'User not authenticated. Please log in first.'
        };
      }

      console.log(`📡 Fetching listings for seller: ${principal.toString()}`);
      
      const rawResult = await this.actor.get_deals_by_seller(principal);
      console.log('📥 Raw result from get_deals_by_seller:', rawResult);

      return {
        success: true,
        data: rawResult
      };
    } catch (error) {
      console.error('💥 Exception in getListingsBySeller:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch seller listings'
      };
    }
  }

  /**
   * Update an existing listing
   */
  async updateListing(id: bigint, updates: Partial<CreateListingFormData>, newIpfsCid?: string): Promise<ApiResponse<null>> {
    try {
      if (!this.actor) {
        await this.initialize(this.currentIdentity || undefined);
      }

      if (!await this.isAuthenticated()) {
        return {
          success: false,
          error: 'User not authenticated. Please log in first.'
        };
      }

      // Transform partial updates to canister format - using array format for optional fields
      const updateRequest: UpdateDealRequest = {
        status: [],
        website_url: [],
        title: [],
        ltv_usd: [],
        cac_usd: [],
        gross_margin_pct: [],
        mrr_usd: [],
        arr_usd: [],
        attachments_cid: [],
        net_profit_usd: [],
        description: [],
        gdpr_compliant: [],
        num_employees: [],
        logo_url: [],
        tax_id: [],
        registered_address: [],
        business_structure: [],
        customer_base: [],
        annual_operating_expenses_usd: [],
        tech_stack: [],
        churn_pct: [],
      };
      
      if (updates.companyName !== undefined) updateRequest.title = [updates.companyName];
      if (updates.businessDescription !== undefined) {
        const description = updates.industry 
          ? `${updates.businessDescription}\n\nIndustry: ${updates.industry}${updates.foundedYear ? `\nFounded: ${updates.foundedYear}` : ''}`
          : updates.businessDescription;
        updateRequest.description = [description];
      }
      if (updates.website !== undefined) updateRequest.website_url = [updates.website];
      if (updates.logo !== undefined) updateRequest.logo_url = [updates.logo];
      if (updates.annualRevenue !== undefined) updateRequest.arr_usd = [BigInt(updates.annualRevenue)];
      if (updates.monthlyRevenue !== undefined) updateRequest.mrr_usd = [BigInt(updates.monthlyRevenue)];
      if (updates.churnRate !== undefined) updateRequest.churn_pct = [updates.churnRate];
      if (updates.grossMargin !== undefined) updateRequest.gross_margin_pct = [updates.grossMargin];
      if (updates.netProfit !== undefined) updateRequest.net_profit_usd = [BigInt(Math.max(0, updates.netProfit))];
      if (updates.customerAcquisitionCost !== undefined) updateRequest.cac_usd = [updates.customerAcquisitionCost];
      if (updates.lifetimeValue !== undefined) updateRequest.ltv_usd = [updates.lifetimeValue];
      if (updates.techStack !== undefined) updateRequest.tech_stack = [updates.techStack.join(', ')];
      if (updates.employeeCount !== undefined) updateRequest.num_employees = [updates.employeeCount];
      if (updates.customerBase !== undefined) updateRequest.customer_base = [updates.customerBase];
      if (updates.operatingExpenses !== undefined) updateRequest.annual_operating_expenses_usd = [BigInt(updates.operatingExpenses)];
      if (updates.businessStructure !== undefined) updateRequest.business_structure = [{ [updates.businessStructure]: null } as GeneratedBusinessStructure];
      if (updates.registeredAddress !== undefined) updateRequest.registered_address = [updates.registeredAddress];
      if (updates.taxId !== undefined) updateRequest.tax_id = [updates.taxId];
      if (updates.gdprCompliant !== undefined) updateRequest.gdpr_compliant = [updates.gdprCompliant];
      if (newIpfsCid !== undefined) updateRequest.attachments_cid = [newIpfsCid ? [newIpfsCid] : []];

      if (!this.actor) {
        throw new Error('Actor not initialized');
      }

      const result: CanisterResult<null> = await this.actor.update_deal(id, updateRequest);

      if ('Ok' in result) {
        return {
          success: true,
          data: null
        };
      } else {
        return {
          success: false,
          error: result.Err
        };
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update listing'
      };
    }
  }

  /**
   * Delete a listing
   */
  async deleteListing(id: bigint): Promise<ApiResponse<null>> {
    try {
      if (!this.actor) {
        await this.initialize(this.currentIdentity || undefined);
      }

      if (!await this.isAuthenticated()) {
        return {
          success: false,
          error: 'User not authenticated. Please log in first.'
        };
      }

      if (!this.actor) {
        throw new Error('Actor not initialized');
      }

      const result: CanisterResult<null> = await this.actor.delete_deal(id);

      if ('Ok' in result) {
        return {
          success: true,
          data: null
        };
      } else {
        return {
          success: false,
          error: result.Err
        };
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete listing'
      };
    }
  }

  /**
   * Set identity from external auth provider
   */
  setIdentity(identity: Identity): void {
    this.currentIdentity = identity;
    // Reset actor to force re-initialization with new identity
    this.actor = null;
  }

  /**
   * Get current user's principal
   */
  async getCurrentUserPrincipal(): Promise<Principal | null> {
    if (this.currentIdentity) {
      return this.currentIdentity.getPrincipal();
    }
    
    if (!this.authClient) {
      await this.initialize();
    }
    
    if (await this.isAuthenticated()) {
      return this.authClient!.getIdentity().getPrincipal();
    }
    
    return null;
  }
}

// Export singleton instance
export const listingService = new ListingService();