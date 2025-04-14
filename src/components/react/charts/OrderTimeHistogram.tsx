import React from 'react';
import Chart from './Chart';
import type { ChartData } from 'chart.js';

interface OrderTimeHistogramProps {
  ordersByTime: { timeOfDay: string; count: number }[];
  id?: string;
  width?: string;
  height?: string;
}

const OrderTimeHistogram: React.FC<OrderTimeHistogramProps> = ({
  ordersByTime,
  id = 'order-time-histogram',
  width,
  height
}) => {
  const data: ChartData<'bar'> = {
    labels: ordersByTime.map(item => item.timeOfDay),
    datasets: [{
      label: 'Number of Orders',
      data: ordersByTime.map(item => item.count),
      backgroundColor: 'rgba(6, 182, 212, 0.7)',
      borderColor: 'rgba(6, 182, 212, 1)',
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
      title="Order Time Distribution"
      subtitle="When you usually place your orders"
      type="bar"
      data={data}
      options={options}
      width={width}
      height={height}
    />
  );
};

export default OrderTimeHistogram;