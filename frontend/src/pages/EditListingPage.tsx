import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EditListingForm } from '../components/forms/EditListingForm';
import { listingService } from '../services/listingService';
import { CreateListingFormData } from '../lib/validationSchemas';
import { BusinessStructure } from '../types/backendTypes';

const EditListingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<CreateListingFormData> | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) {
        setError('Invalid listing ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await listingService.getListing(BigInt(id));
        
        if (result.success && result.data) {
          const listing = result.data;
          
          // Parse industry from description if it exists
          let industry = '';
          let foundedYear = new Date().getFullYear();
          
          if (listing.description.includes('Industry:')) {
            const industryMatch = listing.description.match(/Industry:\s*([^\n]+)/);
            if (industryMatch) {
              industry = industryMatch[1].trim();
            }
          }
          
          if (listing.description.includes('Founded:')) {
            const foundedMatch = listing.description.match(/Founded:\s*(\d{4})/);
            if (foundedMatch) {
              foundedYear = parseInt(foundedMatch[1]);
            }
          }
          
          // Transform DealNFT to CreateListingFormData format
          const initialData: Partial<CreateListingFormData> = {
            companyName: listing.title,
            businessDescription: listing.description.split('\n\nIndustry:')[0], // Remove appended data
            industry,
            website: listing.website_url,
            logo: listing.logo_url || '',
            annualRevenue: Number(listing.arr_usd),
            monthlyRevenue: Number(listing.mrr_usd),
            churnRate: listing.churn_pct,
            grossMargin: listing.gross_margin_pct,
            netProfit: Number(listing.net_profit_usd),
            customerAcquisitionCost: listing.cac_usd,
            lifetimeValue: listing.ltv_usd,
            techStack: listing.tech_stack ? listing.tech_stack.split(', ').filter(Boolean) : [],
            employeeCount: listing.num_employees,
            customerBase: listing.customer_base,
            operatingExpenses: Number(listing.annual_operating_expenses_usd),
            registeredAddress: listing.registered_address,
            taxId: listing.tax_id,
            gdprCompliant: listing.gdpr_compliant,
            businessStructure: Object.keys(listing.business_structure)[0] as BusinessStructure,
            foundedYear,
            // Set some defaults for required fields that might not be in the listing
            location: '', // Not stored in current schema
            dealStructure: 'Asset' as const,
            minimumInvestment: 0,
            askingPrice: 0,
            investmentTimeline: {
              start: new Date(),
              end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            },
            documents: []
          };
          
          setFormData(initialData);
        } else {
          setError('Failed to load listing data');
        }
      } catch (error) {
        console.error('Error fetching listing for edit:', error);
        setError('An error occurred while loading the listing data');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleSubmit = async (data: CreateListingFormData) => {
    if (!id) return;
    
    setSubmitting(true);
    try {
      const result = await listingService.updateListing(BigInt(id), data);
      
      if (result.success) {
        // Navigate back to dashboard with success message
        navigate('/seller/dashboard', { 
          state: { message: 'Listing updated successfully!' }
        });
      } else {
        setError(`Failed to update listing: ${result.success ? 'Unknown error' : result.error}`);
      }
    } catch (error) {
      console.error('Error updating listing:', error);
      setError('An error occurred while updating the listing');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/seller/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Loading Listing</h3>
              <p className="text-sm text-gray-500">Fetching listing data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-sm max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Listing</h3>
            <p className="text-sm text-gray-500 mb-6">{error || 'Failed to load listing data'}</p>
            <div className="flex space-x-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Edit Listing #{id}
                </h1>
                <p className="text-sm text-gray-500">
                  Update your listing information
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="py-6">
        <EditListingForm
          onSubmit={handleSubmit}
          initialData={formData}
          isSubmitting={submitting}
          listingId={parseInt(id!)}
        />
      </div>
    </div>
  );
};

export default EditListingPage;