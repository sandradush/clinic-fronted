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
    <div className="ui-card relative bg-white rounded-xl shadow-card overflow-hidden hover:shadow-md transition-all duration-200" style={{ height: '12rem' }}>
      <div className="absolute top-4 right-4 w-12 h-12 rounded-md flex items-center justify-center text-lg font-semibold shadow-sm" style={{ background: 'rgba(0,0,0,0.04)' }}>
        <div className={`${tone.iconBg} ${tone.iconText} w-10 h-10 rounded-md flex items-center justify-center`}>{icon}</div>
      </div>

      <div className="h-full flex flex-col items-start justify-center px-5">
        <p className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-none">{value}</p>
        <p className="text-sm font-medium text-gray-500 mt-2">{title}</p>
        {subtitle ? <p className="text-xs text-gray-400 mt-2">{subtitle}</p> : null}
      </div>
    </div>
  );
};

export default StatCard;
