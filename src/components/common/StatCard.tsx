import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'blue' | 'purple' | 'yellow' | 'green' | 'orange' | 'red';
  subtitle?: string;
}

const palette: Record<NonNullable<StatCardProps['color']>, { iconBg: string; iconText: string }> = {
  blue: { iconBg: 'bg-blue-100', iconText: 'text-blue-700' },
  purple: { iconBg: 'bg-purple-100', iconText: 'text-purple-700' },
  yellow: { iconBg: 'bg-amber-100', iconText: 'text-amber-700' },
  green: { iconBg: 'bg-emerald-100', iconText: 'text-emerald-700' },
  orange: { iconBg: 'bg-orange-100', iconText: 'text-orange-700' },
  red: { iconBg: 'bg-red-100', iconText: 'text-red-700' },
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'blue', subtitle }) => {
  const tone = palette[color];

  return (
    <div className="ui-card p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tone.iconBg} ${tone.iconText}`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
          <p className="text-sm font-medium text-gray-600 mt-1">{title}</p>
          {subtitle ? <p className="text-xs text-gray-500 mt-1">{subtitle}</p> : null}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
