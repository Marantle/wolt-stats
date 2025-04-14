import React, { useState } from 'react';
import Chart from './Chart';
import type { ChartData } from 'chart.js';

interface TopVenuesByCountChartProps {
  topVenues: { venue: string; count: number }[];
  id?: string;
  width?: string;
  height?: string;
}

const TopVenuesByCountChart: React.FC<TopVenuesByCountChartProps> = ({
  topVenues,
  id = 'top-venues-count',
  width,
  height
}) => {
  const [isCensored, setIsCensored] = useState(true);

  const processedVenues = topVenues.map((item, index) => ({
    ...item,
    venue: isCensored ? `[Venue ${index + 1}]` : item.venue
  }));

  const data: ChartData<'bar'> = {
    labels: processedVenues.map(item => item.venue),
    datasets: [{
      label: 'Number of Orders',
      data: processedVenues.map(item => item.count),
      backgroundColor: processedVenues.map((_, i) => 
        `hsla(${210 + i * 15}, 70%, 60%, 0.7)`
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
          precision: 0
        }
      }
    }
  };

  return (
    <div>
      <button
        onClick={() => setIsCensored(!isCensored)}
        className="mb-2 px-3 py-1 text-sm rounded bg-blue-500 hover:bg-blue-600 text-white"
      >
        {isCensored ? 'Show Venue Names' : 'Hide Venue Names'}
      </button>
      <Chart
        id={id}
        title="Top Venues by Order Count"
        subtitle="Places you order from the most"
        type="bar"
        data={data}
        options={options}
        width={width}
        height={height}
      />
    </div>
  );
};

export default TopVenuesByCountChart;