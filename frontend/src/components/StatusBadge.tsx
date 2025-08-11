import React from 'react';

type ListingStatus = 'Active' | 'Matched' | 'Sold' | 'Withdrawn' | 'Draft' | 'Under Negotiation' | 'Expired';

interface StatusBadgeProps {
  status: ListingStatus;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'filled' | 'outlined' | 'dot';
}

const statusConfig: Record<ListingStatus, {
  color: string;
  bgColor: string;
  dotColor: string;
  borderColor: string;
  icon: React.ReactNode;
}> = {
  Draft: {
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    dotColor: 'bg-gray-400',
    borderColor: 'border-gray-300',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    )
  },
  Active: {
    color: 'text-green-700',
    bgColor: 'bg-green-100',
    dotColor: 'bg-green-500',
    borderColor: 'border-green-300',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    )
  },
  'Under Negotiation': {
    color: 'text-amber-700',
    bgColor: 'bg-amber-100',
    dotColor: 'bg-amber-500',
    borderColor: 'border-amber-300',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    )
  },
  Matched: {
    color: 'text-blue-700',
    bgColor: 'bg-blue-100',
    dotColor: 'bg-blue-500',
    borderColor: 'border-blue-300',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    )
  },
  Sold: {
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-100',
    dotColor: 'bg-emerald-500',
    borderColor: 'border-emerald-300',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  Expired: {
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    dotColor: 'bg-red-500',
    borderColor: 'border-red-300',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  Withdrawn: {
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    dotColor: 'bg-gray-500',
    borderColor: 'border-gray-300',
    icon: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
      </svg>
    )
  }
};

const sizeClasses = {
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base'
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className = '', 
  size = 'sm',
  variant = 'filled'
}) => {
  const config = statusConfig[status];
  
  if (variant === 'dot') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <div className={`w-2 h-2 rounded-full mr-2 ${config.dotColor}`} />
        <span className="text-sm font-medium text-gray-900">{status}</span>
      </div>
    );
  }
  
  if (variant === 'outlined') {
    return (
      <span 
        className={`inline-flex items-center ${sizeClasses[size]} font-medium rounded-full border ${
          config.color
        } ${config.borderColor} bg-white ${className}`}
      >
        <span className="mr-1.5">
          {config.icon}
        </span>
        {status}
      </span>
    );
  }
  
  return (
    <span 
      className={`inline-flex items-center ${sizeClasses[size]} font-medium rounded-full ${
        config.color
      } ${
        config.bgColor
      } ${className}`}
    >
      <span className="mr-1.5">
        {config.icon}
      </span>
      {status}
    </span>
  );
};

export default StatusBadge;