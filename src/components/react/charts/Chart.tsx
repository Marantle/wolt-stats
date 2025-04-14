import React from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export interface ChartProps {
  id: string;
  title: string;
  subtitle?: string;
  type: 'bar' | 'line';
  data: ChartData<'bar' | 'line'>;
  options?: ChartOptions<'bar' | 'line'>;
  width?: string;
  height?: string;
}

const ChartComponent: React.FC<ChartProps> = ({
  id,
  title,
  subtitle,
  type,
  data,
  options = {},
  width = '100%',
  height = '400px'
}) => {
  // Default options - can be overridden by passed options
  const defaultOptions: ChartOptions<'bar' | 'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      {subtitle && <p className="text-gray-500 mb-4">{subtitle}</p>}
      <div style={{ width, height, position: 'relative' }}>
        {type === 'bar' ? (
          <Bar id={id} data={data as ChartData<'bar'>} options={mergedOptions} />
        ) : (
          <Line id={id} data={data as ChartData<'line'>} options={mergedOptions} />
        )}
      </div>
    </div>
  );
};

export default ChartComponent;