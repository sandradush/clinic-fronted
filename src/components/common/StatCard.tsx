import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'blue' | 'purple' | 'yellow' | 'green' | 'orange' | 'red';
  subtitle?: string;
}

const palette: Record<NonNullable<StatCardProps['color']>, { iconBg: string; iconText: string }> = {
  blue: { iconBg: 'bg-brand-100', iconText: 'text-brand-700' },
  purple: { iconBg: 'bg-purple-100', iconText: 'text-purple-700' },
  yellow: { iconBg: 'bg-amber-100', iconText: 'text-amber-700' },
  green: { iconBg: 'bg-emerald-100', iconText: 'text-emerald-700' },
  orange: { iconBg: 'bg-orange-100', iconText: 'text-orange-700' },
  red: { iconBg: 'bg-red-100', iconText: 'text-red-700' },
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color = 'blue', subtitle }) => {
  const tone = palette[color];

  return (
    <div className="ui-card relative bg-white rounded-xl shadow-card overflow-hidden hover:shadow-md transition-all duration-200" style={{ height: '8rem' }}>
      <div className="absolute top-3 right-3 w-10 h-10 rounded-md flex items-center justify-center text-base shadow-sm" style={{ background: 'rgba(0,0,0,0.04)' }}>
        <div className={`${tone.iconBg} ${tone.iconText} w-8 h-8 rounded-md flex items-center justify-center`}>{icon}</div>
      </div>

      <div className="h-full flex flex-col items-start justify-center px-4">
        <p className="text-2xl md:text-3xl font-normal text-gray-900 leading-none">{value}</p>
        <p className="text-sm font-medium text-gray-500 mt-2">{title}</p>
        {subtitle ? <p className="text-xs text-gray-400 mt-2">{subtitle}</p> : null}
      </div>
    </div>
  );
};

export default StatCard;
