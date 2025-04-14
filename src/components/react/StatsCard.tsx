import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: string;
  color?: 'blue' | 'green' | 'red' | 'purple' | 'amber';
  id?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  description,
  icon,
  color = 'blue',
  id
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
  };

  const bgClass = colorClasses[color] || colorClasses.blue;

  return (
    <div className={`p-6 rounded-lg shadow-sm border ${bgClass} mb-6`} id={id}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-3xl font-bold mt-2">{value}</p>
          {description && <p className="mt-1 text-sm opacity-80">{description}</p>}
        </div>
        {icon && <div className="text-4xl opacity-75">{icon}</div>}
      </div>
    </div>
  );
};

export default StatsCard;