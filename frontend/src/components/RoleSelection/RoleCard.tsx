import React from 'react';
import { UserRole, RoleData } from '../../types/role.types';

interface RoleCardProps {
  role: UserRole;
  data: RoleData;
  isSelected: boolean;
  onSelect: (role: UserRole) => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({ role, data, isSelected, onSelect }) => {
  return (
    <div
      className="group cursor-pointer transform transition-all duration-300"
      onClick={() => onSelect(role)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(role);
        }
      }}
      aria-label={`Select ${data.title} role`}
    >
      <div className={`
        relative bg-white border rounded-2xl p-8 h-full hover:shadow-lg transition-all duration-300
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-lg' 
          : 'border-gray-200 hover:border-blue-300'
        }
      `}>
        {/* Icon */}
        <div className="mb-6">
          <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center text-white">
            {data.icon}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h3 className="text-2xl font-bold text-gray-900">
            {data.title}
          </h3>
          
          <p className="text-gray-600 leading-relaxed text-lg">
            {data.description}
          </p>

          {/* Features List */}
          <ul className="space-y-3 mt-6">
            {data.features.map((feature, index) => (
              <li key={index} className="flex items-center space-x-3 text-gray-700">
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          {/* Selection Indicator */}
          {isSelected && (
            <div className="mt-6 flex items-center justify-center">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Selected</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};