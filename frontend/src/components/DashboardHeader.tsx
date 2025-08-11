import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
  onSidebarToggle: () => void;
  actions?: React.ReactNode;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  subtitle,
  onSidebarToggle,
  actions,
}) => {
  const { identity } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'New offer received',
      message: 'You have a new offer on AI Analytics Platform',
      time: '2 minutes ago',
      unread: true,
    },
    {
      id: 2,
      title: 'Listing view milestone',
      message: 'Your listing has reached 100 views',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Profile updated',
      message: 'Your seller profile has been successfully updated',
      time: '2 hours ago',
      unread: false,
    },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            onClick={onSidebarToggle}
          >
            <span className="sr-only">Open sidebar</span>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Title */}
          <div className="ml-4 lg:ml-0">
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="search"
                placeholder="Search..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Custom Actions */}
          {actions}

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <span className="sr-only">View notifications</span>
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5 5-5h-5m-6 10v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2h2a2 2 0 012 2zm0-5V7a2 2 0 012-2h2a2 2 0 012 2v5a2 2 0 01-2 2H9a2 2 0 01-2-2z" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 px-2 py-1 text-xs font-medium text-white bg-red-500 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          notification.unread
                            ? 'bg-blue-50 hover:bg-blue-100'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-start">
                          {notification.unread && (
                            <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button className="w-full text-center text-sm text-blue-600 hover:text-blue-500 font-medium">
                      View all notifications
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center max-w-xs bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setShowProfile(!showProfile)}
            >
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {identity ? identity.getPrincipal().toString().charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div className="hidden md:block ml-3 text-left">
                <p className="text-sm font-medium text-gray-700">Seller Account</p>
                <p className="text-xs text-gray-500">
                  {identity ? `${identity.getPrincipal().toString().slice(0, 8)}...` : 'Not connected'}
                </p>
              </div>
              <svg className="hidden md:block ml-2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Profile dropdown menu */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                <div className="py-1">
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Your Profile
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Settings
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Billing
                  </a>
                  <div className="border-t border-gray-200 my-1"></div>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Sign out
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;