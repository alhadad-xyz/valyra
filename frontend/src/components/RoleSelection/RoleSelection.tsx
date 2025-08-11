import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole } from '../../contexts/RoleContext';
import { UserRole, RoleData } from '../../types/role.types';
import { RoleCard } from './RoleCard';

const roleData: Record<UserRole, RoleData> = {
  seller: {
    title: 'Founder',
    description: 'Exit your Web3 company with confidence. Get maximum value through our streamlined M&A process.',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    features: [
      'List your company for acquisition',
      'AI-powered valuations',
      'Connect with qualified buyers',
      'Secure escrow & fast exit'
    ],
    route: '/seller/dashboard'
  },
  buyer: {
    title: 'Acquirer',
    description: 'Discover high-growth Web3 companies ready for acquisition. Access vetted deals with complete transparency.',
    icon: (
      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    features: [
      'Browse curated deal flow',
      'Strategic company matching',
      'Complete due diligence access',
      'Streamlined acquisition process'
    ],
    route: '/buyer/dashboard'
  }
};

export const RoleSelection: React.FC = () => {
  const { setRole } = useRole();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
  };

  const handleConfirm = async () => {
    if (!selectedRole) return;
    
    setIsLoading(true);
    
    try {
      setRole(selectedRole);
      navigate(roleData[selectedRole].route);
    } catch (error) {
      console.error('Error setting role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-blue-50 flex flex-col overflow-hidden">
      {/* Navigation */}
      <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-sm">
        <div className="flex items-center space-x-2 group">
          <div className="w-8 h-8 bg-black rounded transform rotate-45 flex items-center justify-center transition-all duration-300 group-hover:rotate-[60deg] group-hover:scale-110">
            <span className="text-white text-xs font-bold transform -rotate-45 group-hover:-rotate-[60deg] transition-transform duration-300">V</span>
          </div>
          <span className="text-xl font-bold transition-colors duration-300 group-hover:text-blue-600">Valyra</span>
        </div>
        
        <div className="text-sm text-gray-600">
          Step 2 of 2: Choose Your Role
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Choose Your Role
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Select how you'd like to participate in the Valyra ecosystem. You can switch roles anytime from your dashboard.
            </p>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {(Object.entries(roleData) as [UserRole, RoleData][]).map(([role, data]) => (
              <RoleCard
                key={role}
                role={role}
                data={data}
                isSelected={selectedRole === role}
                onSelect={handleRoleSelect}
              />
            ))}
          </div>

          {/* Continue Button */}
          <div className="text-center">
            <button
              onClick={handleConfirm}
              disabled={!selectedRole || isLoading}
              className={`
                px-12 py-4 rounded-full text-lg font-medium transition-all duration-300
                ${selectedRole && !isLoading
                  ? 'bg-black text-white hover:bg-gray-800 cursor-pointer'
                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                }
              `}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>Continue to Dashboard</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5-5 5M6 12h12" />
                  </svg>
                </span>
              )}
            </button>
            
            {selectedRole && !isLoading && (
              <p className="mt-4 text-sm text-gray-500 animate-fadeIn">
                You'll be taken to your {roleData[selectedRole].title} dashboard
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="pb-16">
        <p className="text-center text-gray-500 text-sm mb-8">Trusted by Web3 founders & acquirers</p>
        <div className="flex justify-center items-center space-x-12 opacity-60">
          {['DeFi Protocols', 'NFT Projects', 'Gaming Studios', 'Infrastructure'].map((category) => (
            <div 
              key={category}
              className="text-gray-400 text-lg font-semibold"
            >
              {category}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};