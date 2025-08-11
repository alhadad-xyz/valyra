import React, { useState } from 'react';
import { ListingsTable } from '../components/ListingsTable';
import { useListings } from '../hooks/useListings';
import Sidebar from '../components/Sidebar';
import DashboardHeader from '../components/DashboardHeader';
import { StatsCards } from '../components/StatsCards';

const SellerDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const { listings, loading, error, refresh, lastUpdated } = useListings({
    refreshInterval: 5000,
    autoRefresh: true,
  });

  const handleEditListing = (id: number) => {
    console.log('Edit listing:', id);
    // TODO: Navigate to edit form or open modal
  };

  const handleViewListing = (id: number) => {
    console.log('View listing:', id);
    // TODO: Navigate to listing detail page
  };

  const handleDeleteListing = (id: number) => {
    console.log('Delete listing:', id);
    // TODO: Show confirmation dialog and delete
  };

  const handleRefresh = async () => {
    await refresh();
  };

  // TODO: Remove this console.log once create form is implemented
  console.log('showCreateForm state:', showCreateForm, typeof setShowCreateForm);

  const statsData = [
    {
      title: 'Total Listings',
      value: listings.length,
      change: '+2',
      changeType: 'increase' as const,
      iconColor: 'bg-blue-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      trend: [0.6, 0.8, 0.4, 0.9, 0.7, 1.0, 0.8],
    },
    {
      title: 'Active Listings',
      value: listings.filter(l => l.status === 'Active').length,
      change: '+1',
      changeType: 'increase' as const,
      iconColor: 'bg-green-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      trend: [0.3, 0.6, 0.8, 0.4, 0.9, 0.7, 1.0],
    },
    {
      title: 'Total Offers',
      value: listings.reduce((sum, l) => sum + (l.offers_count || 0), 0),
      change: '+5',
      changeType: 'increase' as const,
      iconColor: 'bg-purple-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      trend: [0.2, 0.4, 0.3, 0.8, 0.6, 0.9, 1.0],
    },
    {
      title: 'Avg. ARR',
      value: listings.length > 0 
        ? `$${Math.round(listings.reduce((sum, l) => sum + l.arr_usd, 0) / listings.length / 1000)}k`
        : '$0',
      change: '+12%',
      changeType: 'increase' as const,
      iconColor: 'bg-amber-500',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      trend: [0.5, 0.7, 0.6, 0.8, 0.9, 0.7, 1.0],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader
          title="Dashboard"
          subtitle="Manage your listings and track performance"
          onSidebarToggle={() => setSidebarOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Stats Cards */}
            <div className="mb-8">
              <StatsCards stats={statsData} />
            </div>

            {/* Quick Actions */}
            <div className="mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200">
                    <svg className="w-8 h-8 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">Create Listing</p>
                      <p className="text-xs text-gray-500">Add a new listing</p>
                    </div>
                  </button>
                  <button className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200">
                    <svg className="w-8 h-8 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">View Analytics</p>
                      <p className="text-xs text-gray-500">Performance insights</p>
                    </div>
                  </button>
                  <button className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200">
                    <svg className="w-8 h-8 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">Messages</p>
                      <p className="text-xs text-gray-500">2 unread messages</p>
                    </div>
                  </button>
                  <button className="flex items-center p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors duration-200">
                    <svg className="w-8 h-8 text-amber-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">Settings</p>
                      <p className="text-xs text-gray-500">Account settings</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Listings Table */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Your Listings</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage and track all your business listings
                    {lastUpdated && (
                      <span className="ml-2">
                        • Last updated {lastUpdated.toLocaleTimeString()}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleRefresh}
                    disabled={loading}
                    className="inline-flex items-center px-3 py-2 border border-gray-200 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
                  >
                    <svg 
                      className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                      />
                    </svg>
                    Refresh
                  </button>
                </div>
              </div>
              
              {error && (
                <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <ListingsTable
                listings={listings}
                loading={loading}
                onEdit={handleEditListing}
                onView={handleViewListing}
                onDelete={handleDeleteListing}
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {[
                    { type: 'offer', message: 'New offer received on AI Analytics Platform', time: '2 minutes ago', status: 'new' },
                    { type: 'view', message: 'Your listing was viewed 15 times today', time: '1 hour ago', status: 'info' },
                    { type: 'update', message: 'B2B Marketing Tool listing updated successfully', time: '3 hours ago', status: 'success' },
                    { type: 'message', message: 'New message from potential buyer', time: '5 hours ago', status: 'new' },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                        activity.status === 'new' ? 'bg-blue-500' :
                        activity.status === 'success' ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="w-full text-center text-sm text-blue-600 hover:text-blue-500 font-medium">
                    View all activity
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Average Views per Listing</p>
                      <p className="text-xs text-gray-500">Last 30 days</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600">127</p>
                      <p className="text-xs text-green-600">+15%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Conversion Rate</p>
                      <p className="text-xs text-gray-500">Views to offers</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600">8.3%</p>
                      <p className="text-xs text-green-600">+2.1%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Avg. Time to Offer</p>
                      <p className="text-xs text-gray-500">From listing creation</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-amber-600">12 days</p>
                      <p className="text-xs text-red-600">+2 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SellerDashboard;