import React from 'react';
import Chart from './Chart';
import type { ChartData } from 'chart.js';

interface AvgOrderOverTimeChartProps {
  avgOrderByMonth: { month: string; average: number }[];
  id?: string;
  width?: string;
  height?: string;
}

const AvgOrderOverTimeChart: React.FC<AvgOrderOverTimeChartProps> = ({
  avgOrderByMonth,
  id = 'avg-order-over-time',
  width,
  height
}) => {
  // Format date for chart display
  const formatMonth = (monthStr: string): string => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const data: ChartData<'line'> = {
    labels: avgOrderByMonth.map(item => formatMonth(item.month)),
    datasets: [{
      label: 'Average Order Value (€)',
      data: avgOrderByMonth.map(item => item.average),
      backgroundColor: 'rgba(139, 92, 246, 0.2)',
      borderColor: 'rgba(139, 92, 246, 1)',
      borderWidth: 2,
      tension: 0.1,
      fill: true
    }]
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return '€' + Number(value).toFixed(2);
          }
        }
      }
    }
  };

  return (
    <Chart
      id={id}
      title="Average Order Value Over Time"
      subtitle="How your average order size has changed"
      type="line"
      data={data}
      options={options}
      width={width}
      height={height}
    />
  );
};

export default AvgOrderOverTimeChart;