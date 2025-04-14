import React from 'react';
import Chart, { type ChartProps } from './Chart';
import type { ChartData } from 'chart.js';

interface MonthlyOrdersChartProps {
  monthlyOrders: { month: string; count: number; total: number }[];
  id?: string;
  width?: string;
  height?: string;
}

const MonthlyOrdersChart: React.FC<MonthlyOrdersChartProps> = ({
  monthlyOrders,
  id = 'monthly-orders',
  width,
  height
}) => {
  // Format date for chart display
  const formatMonth = (monthStr: string): string => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const data: ChartData<'bar'> = {
    labels: monthlyOrders.map(item => formatMonth(item.month)),
    datasets: [{
      label: 'Number of Orders',
      data: monthlyOrders.map(item => item.count),
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1
    }]
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  return (
    <Chart
      id={id}
      title="Monthly Order Count"
      subtitle="Number of orders placed each month"
      type="bar"
      data={data}
      options={options}
      width={width}
      height={height}
    />
  );
};

export default MonthlyOrdersChart;