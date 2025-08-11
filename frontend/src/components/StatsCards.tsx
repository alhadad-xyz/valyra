import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: React.ReactNode;
  iconColor?: string;
  trend?: number[];
}

interface StatsCardsProps {
  stats: StatCardProps[];
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeType = 'neutral',
  icon,
  iconColor = 'bg-blue-500',
  trend,
}) => {
  const changeColorMap = {
    increase: 'text-green-600 bg-green-100',
    decrease: 'text-red-600 bg-red-100',
    neutral: 'text-gray-600 bg-gray-100',
  };

  const changeIconMap = {
    increase: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l10-10M17 7l-10 10" />
      </svg>
    ),
    decrease: (
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17l-10-10M7 7l10 10" />
      </svg>
    ),
    neutral: null,
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mb-2">{value}</p>
          
          {change && (
            <div className="flex items-center space-x-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                changeColorMap[changeType]
              }`}>
                {changeIconMap[changeType]}
                <span className="ml-1">{change}</span>
              </span>
              <span className="text-xs text-gray-500">from last month</span>
            </div>
          )}
          
          {trend && (
            <div className="mt-3">
              <div className="flex items-end space-x-1 h-8">
                {trend.map((value, index) => (
                  <div
                    key={index}
                    className="bg-blue-200 rounded-sm flex-1"
                    style={{ height: `${Math.max(value * 20, 4)}px` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-xl ${iconColor} text-white`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export { StatsCards, StatCard };
export default StatsCards;