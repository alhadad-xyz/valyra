import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';

interface Deal {
  id: number;
  company_name: string;
  valuation: number;
  revenue: number;
  status: string;
  created_at: number;
}

interface Offer {
  id: number;
  deal_id: number;
  buyer: string;
  amount: number;
  equity_percentage: number;
  status: string;
}

export const SellerDashboard: React.FC = () => {
  const { identity } = useAuth();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (identity) {
      fetchDeals();
      fetchOffers();
    }
  }, [identity]);

  const fetchDeals = async () => {
    // Integration with listing_registry canister
    try {
      // Mock data for now
      setDeals([
        {
          id: 1,
          company_name: "TechStartup Inc",
          valuation: 5000000,
          revenue: 1200000,
          status: "Active",
          created_at: Date.now()
        }
      ]);
    } catch (error) {
      console.error('Error fetching deals:', error);
    }
  };

  const fetchOffers = async () => {
    // Integration with listing_registry canister for offers
    try {
      // Mock data for now
      setOffers([
        {
          id: 1,
          deal_id: 1,
          buyer: "investor_principal",
          amount: 2000000,
          equity_percentage: 40.0,
          status: "Pending"
        }
      ]);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Founder Dashboard</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create New Listing
        </button>
      </div>

      {/* Active Listings */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Listings</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valuation</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {deals.map((deal) => (
                <tr key={deal.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{deal.company_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${deal.valuation.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${deal.revenue.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      {deal.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-900">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Received Offers */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Received Offers</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Buyer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equity %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {offers.map((offer) => (
                <tr key={offer.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{offer.buyer.slice(0, 20)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap">${offer.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{offer.equity_percentage}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      {offer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap space-x-2">
                    <button className="text-green-600 hover:text-green-900">Accept</button>
                    <button className="text-blue-600 hover:text-blue-900">Counter</button>
                    <button className="text-red-600 hover:text-red-900">Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};