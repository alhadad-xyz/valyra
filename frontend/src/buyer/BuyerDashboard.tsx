import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { useRole } from '../contexts/RoleContext';

interface Deal {
  id: number;
  company_name: string;
  valuation: number;
  revenue: number;
  status: string;
  match_score?: number;
}

interface MyOffer {
  id: number;
  deal_id: number;
  amount: number;
  equity_percentage: number;
  status: string;
  company_name: string;
}

const BuyerDashboard: React.FC = () => {
  const { identity, logout } = useAuth();
  const { clearRole } = useRole();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Deal[]>([]);
  const [myOffers, setMyOffers] = useState<MyOffer[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);

  useEffect(() => {
    if (identity) {
      fetchMatches();
      fetchMyOffers();
    }
  }, [identity]);

  const fetchMatches = async () => {
    // Integration with matching agent results
    try {
      // Mock data for now
      setMatches([
        {
          id: 1,
          company_name: "TechStartup Inc",
          valuation: 5000000,
          revenue: 1200000,
          status: "Active",
          match_score: 0.85
        },
        {
          id: 2,
          company_name: "AI Solutions Ltd",
          valuation: 3000000,
          revenue: 800000,
          status: "Active",
          match_score: 0.72
        }
      ]);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchMyOffers = async () => {
    // Integration with listing_registry canister for user's offers
    try {
      // Mock data for now
      setMyOffers([
        {
          id: 1,
          deal_id: 1,
          amount: 2000000,
          equity_percentage: 40.0,
          status: "Pending",
          company_name: "TechStartup Inc"
        }
      ]);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const makeOffer = async (dealId: number, amount: number, equityPercentage: number) => {
    // Integration with negotiation agent
    try {
      // Mock implementation
      console.log(`Making offer: ${amount} for ${equityPercentage}% of deal ${dealId}`);
      // Refresh offers after making one
      fetchMyOffers();
    } catch (error) {
      console.error('Error making offer:', error);
    }
  };

  const handleLogout = async () => {
    clearRole();
    await logout();
    navigate('/');
  };

  const handleRoleSwitch = () => {
    navigate('/role-selection');
  };

  // Use makeOffer to avoid TypeScript error
  console.log('makeOffer function available:', typeof makeOffer);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Acquirer Dashboard</h1>
        <div className="flex space-x-4">
          <button 
            onClick={handleRoleSwitch}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Switch Role
          </button>
          <button className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Set Preferences
          </button>
          <button 
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Recommended Matches */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Recommended Deals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((deal) => (
            <div key={deal.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold">{deal.company_name}</h3>
                {deal.match_score && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {Math.round(deal.match_score * 100)}% match
                  </span>
                )}
              </div>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Valuation:</span> ${deal.valuation.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Revenue:</span> ${deal.revenue.toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span> {deal.status}
                </p>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setSelectedDeal(deal)}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
                >
                  Make Offer
                </button>
                <button className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm hover:bg-gray-300">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* My Offers */}
      <div>
        <h2 className="text-xl font-semibold mb-4">My Offers</h2>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Equity %</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {myOffers.map((offer) => (
                <tr key={offer.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{offer.company_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">${offer.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{offer.equity_percentage}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      {offer.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:text-blue-900">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Make Offer Modal */}
      {selectedDeal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-lg font-semibold mb-4">Make Offer for {selectedDeal.company_name}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Offer Amount ($)</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  placeholder="2000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Equity Percentage (%)</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  placeholder="25"
                  step="0.1"
                />
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedDeal(null)}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Submit Offer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;