import React from 'react';
import Chart from './Chart';
import type { ChartData } from 'chart.js';

interface OrdersByDayChartProps {
  ordersByDay: { day: string; count: number }[];
  id?: string;
  width?: string;
  height?: string;
}

const OrdersByDayChart: React.FC<OrdersByDayChartProps> = ({
  ordersByDay,
  id = 'orders-by-day',
  width,
  height
}) => {
  const data: ChartData<'bar'> = {
    labels: ordersByDay.map(item => item.day),
    datasets: [{
      label: 'Number of Orders',
      data: ordersByDay.map(item => item.count),
      backgroundColor: 'rgba(245, 158, 11, 0.7)',
      borderColor: 'rgba(245, 158, 11, 1)',
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
      title="Busiest Days of the Week"
      subtitle="Which weekdays you usually order on"
      type="bar"
      data={data}
      options={options}
      width={width}
      height={height}
    />
  );
};

export default OrdersByDayChart;