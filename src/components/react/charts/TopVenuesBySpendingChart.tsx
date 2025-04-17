import React from 'react';
import Chart from './Chart';
import { type ChartData } from 'chart.js';

interface TopVenuesBySpendingChartProps {
  topVenues: { venue: string; total: number }[];
  id?: string;
  width?: string;
  height?: string;
  isCensored?: boolean;
}

const TopVenuesBySpendingChart: React.FC<TopVenuesBySpendingChartProps> = ({
  topVenues,
  id = 'top-venues-spending',
  width,
  height,
  isCensored = true
}) => {
  const processedVenues = topVenues.map((item, index) => ({
    ...item,
    venue: isCensored ? `[Venue ${index + 1}]` : item.venue
  }));

  const data: ChartData<'bar'> = {
    labels: processedVenues.map(item => item.venue),
    datasets: [{
      label: 'Total Spent (€)',
      data: processedVenues.map(item => item.total),
      backgroundColor: processedVenues.map((_, i) => 
        `hsla(${120 + i * 15}, 70%, 50%, 0.7)`
      ),
      borderWidth: 1
    }]
  };

  const options = {
    indexAxis: 'y' as const,
    scales: {
      x: {
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
    <div>
      <Chart
        id={id}
        title="Top Venues by Total Spent"
        subtitle={isCensored ? "Where you've spent the most money (Names hidden - use buttons above to show)" : "Where you've spent the most money"}
        type="bar"
        data={data}
        options={options}
        width={width}
        height={height}
      />
    </div>
  );
};

export default TopVenuesBySpendingChart;