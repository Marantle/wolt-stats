import React from 'react';
import Chart from './Chart';
import { type ChartData } from 'chart.js';

interface MonthlySpendingChartProps {
  monthlyOrders: { month: string; count: number; total: number }[];
  id?: string;
  width?: string;
  height?: string;
}

const MonthlySpendingChart: React.FC<MonthlySpendingChartProps> = ({
  monthlyOrders,
  id = 'monthly-spending',
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
    labels: monthlyOrders.map(item => formatMonth(item.month)),
    datasets: [{
      label: 'Total Spent (€)',
      data: monthlyOrders.map(item => item.total),
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      borderColor: 'rgba(16, 185, 129, 1)',
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
      title="Monthly Spending"
      subtitle="Total amount spent each month"
      type="line"
      data={data}
      options={options}
      width={width}
      height={height}
    />
  );
};

export default MonthlySpendingChart;