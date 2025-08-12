import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateListingForm } from '../components/forms/CreateListingForm';
import { CreateListingFormData } from '../lib/validationSchemas';
import { listingService } from '../services/listingService';
import { uploadFileArchive } from '../services/ipfsService';
import { mockUploadFileArchive, shouldUseMockIPFS } from '../services/mockIpfsService';
import { mockCreateListing, shouldUseMockListingService } from '../services/mockListingService';

export const CreateListing: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: CreateListingFormData) => {
    setIsSubmitting(true);
    setError(null);

    // Debug logging
    console.log('🔧 Environment Debug Info:', {
      VITE_ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT,
      VITE_LISTING_REGISTRY_CANISTER_ID: import.meta.env.VITE_LISTING_REGISTRY_CANISTER_ID,
      VITE_IC_HOST: import.meta.env.VITE_IC_HOST,
      shouldUseMock: shouldUseMockListingService(),
    });

    try {
      let ipfsCid: string | undefined;

      // Upload documents to IPFS if provided
      if (formData.documents && formData.documents.length > 0) {
        console.log('Uploading documents to IPFS...');
        
        const archiveName = `${formData.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_documents`;
        
        let uploadResult;
        if (shouldUseMockIPFS()) {
          console.log('Using Mock IPFS for local development');
          uploadResult = await mockUploadFileArchive(formData.documents, archiveName);
        } else {
          console.log('Using real IPFS service');
          uploadResult = await uploadFileArchive(formData.documents, archiveName);
        }
        
        ipfsCid = uploadResult.cid;
        console.log('Documents uploaded successfully, CID:', ipfsCid);
      }

      // Create the listing
      console.log('Creating listing...');
      let result;
      
      if (shouldUseMockListingService()) {
        console.log('Using Mock Listing Service for local development');
        result = await mockCreateListing(formData, ipfsCid);
      } else {
        console.log('Using real Internet Computer listing service');
        result = await listingService.createListing(formData, ipfsCid);
      }

      if (result.success) {
        console.log('✅ Listing created successfully with ID:', result.data);
        
        // Verify the listing was actually stored by fetching it back
        // Add a small delay to allow the canister to process the storage
        console.log('⏳ Waiting 2 seconds for canister to process storage...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        try {
          console.log('🔍 Verifying listing was stored by fetching it back...');
          const verifyResult = await listingService.getListing(result.data);
          if (verifyResult.success) {
            console.log('✅ Verification successful - listing found in canister:', verifyResult.data);
          } else {
            console.warn('⚠️ Verification failed - listing not found in canister:', verifyResult.error);
            
            // Try to get all listing IDs to see if it was stored with a different ID
            console.log('🔍 Checking all listing IDs in canister...');
            const allIdsResult = await listingService.getAllListingIds();
            if (allIdsResult.success) {
              console.log('📋 All listing IDs in canister:', allIdsResult.data.map(id => id.toString()));
              const hasOurId = allIdsResult.data.some(id => id === result.data);
              console.log(`🔍 Our ID ${result.data} ${hasOurId ? 'IS' : 'IS NOT'} in the canister`);
            } else {
              console.warn('⚠️ Failed to fetch all listing IDs:', allIdsResult.error);
            }
          }
        } catch (verifyError) {
          console.warn('⚠️ Error during verification:', verifyError);
        }
        
        // Show success message
        alert(`✅ Listing created successfully!\n\nListing ID: ${result.data}\n${ipfsCid ? `Documents uploaded to IPFS: ${ipfsCid}` : 'No documents uploaded'}`);
        
        // Navigate back to seller dashboard
        navigate('/seller', { 
          state: { 
            message: 'Listing created successfully!',
            listingId: result.data.toString()
          }
        });
      } else {
        setError(result.error);
        console.error('Failed to create listing:', result.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Error in handleSubmit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>
              <p className="mt-2 text-gray-600">
                List your SaaS business for acquisition on the Valyra marketplace
              </p>
            </div>
            
            <button
              onClick={() => navigate('/seller')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              ← Back to Dashboard
            </button>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error Creating Listing</h3>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                  <div className="mt-4">
                    <button
                      onClick={() => setError(null)}
                      className="text-sm font-medium text-red-800 hover:text-red-600"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h2 className="text-lg font-medium text-blue-900 mb-4">💡 Tips for a Successful Listing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-blue-900 mb-2">📊 Financial Transparency</h3>
              <p className="text-blue-700">
                Provide accurate financial metrics. Buyers value transparency and will verify numbers during due diligence.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-2">📄 Quality Documentation</h3>
              <p className="text-blue-700">
                Upload comprehensive due diligence documents including financial statements, customer references, and legal docs.
              </p>
            </div>
            <div>
              <h3 className="font-medium text-blue-900 mb-2">🎯 Realistic Pricing</h3>
              <p className="text-blue-700">
                Price your business based on industry multiples. SaaS businesses typically sell for 3-10x ARR depending on growth and margins.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border">
          <CreateListingForm
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Need help? Check out our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              seller guide
            </a>{' '}
            or{' '}
            <a href="#" className="text-blue-600 hover:text-blue-500">
              contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};