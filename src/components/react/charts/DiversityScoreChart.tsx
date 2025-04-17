import React from 'react';
import type { WoltOrder } from '../../../../woltorder';
import { calculateDiversityScores, formatMonth, type DiversityScore } from '../../../utils/orderUtils';
import Chart from './Chart';

interface DiversityScoreChartProps {
  orders?: WoltOrder[];
  diversityScores?: DiversityScore[];
}

const DiversityScoreChart: React.FC<DiversityScoreChartProps> = ({ orders, diversityScores }) => {
  // Calculate diversity scores from orders if not provided
  const scores = diversityScores || (orders ? calculateDiversityScores(orders) : []);

  // If we have no data, return a placeholder
  if (scores.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 h-[400px] flex items-center justify-center">
        <p className="text-gray-500">No diversity score data available</p>
      </div>
    );
  }

  const chartData = {
    labels: scores.map(item => formatMonth(item.month)),
    datasets: [
      {
        label: 'Diversity Score',
        data: scores.map(item => item.score),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderWidth: 2,
        tension: 0.3,
      },
      {
        label: 'Unique Venues Ratio',
        data: scores.map(item => item.uniqueVenuesRatio * 100),
        borderColor: 'rgb(153, 102, 255)',
        backgroundColor: 'rgba(153, 102, 255, 0.5)',
        borderWidth: 2,
        tension: 0.3,
        hidden: true,
      },
      {
        label: 'Unique Items Ratio',
        data: scores.map(item => item.uniqueItemsRatio * 100),
        borderColor: 'rgb(255, 159, 64)',
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        borderWidth: 2,
        tension: 0.3,
        hidden: true,
      },
      {
        label: 'New Order Ratio',
        data: scores.map(item => item.newOrderRatio * 100),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderWidth: 2,
        tension: 0.3,
        hidden: true,
      }
    ]
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Score (0-100)',
        }
      }
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y || 0;
            return `${label}: ${value.toFixed(1)}`;
          }
        }
      }
    }
  };

  const averageScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
  
  const years = [...new Set(scores.map(s => s.month.split('-')[0]))].sort();
  
  let subtitle = "";
  const allTimeHighest = Math.max(...scores.map(s => s.score));
  const allTimeHighestMonth = formatMonth(scores.find(s => s.score === allTimeHighest)?.month || '');
  
  if (years.length > 1) {
    // Multiple years of data - show the highest from the most recent year
    const mostRecentYear = years[years.length - 1];
    const recentYearScores = scores.filter(s => s.month.startsWith(mostRecentYear));
    
    if (recentYearScores.length > 0) {
      const recentHighest = Math.max(...recentYearScores.map(s => s.score));
      const recentHighestMonth = formatMonth(recentYearScores.find(s => s.score === recentHighest)?.month || '');
      subtitle = `Average: ${averageScore.toFixed(1)} | ${mostRecentYear} Highest: ${recentHighest.toFixed(1)} (${recentHighestMonth}) | All-time Highest: ${allTimeHighest.toFixed(1)} (${allTimeHighestMonth})`;
    } else {
      subtitle = `Average: ${averageScore.toFixed(1)} | All-time Highest: ${allTimeHighest.toFixed(1)} (${allTimeHighestMonth})`;
    }
  } else if (scores.length > 3) {
    // Only one year but several months - highlight the last 3 months
    const recentScores = scores.slice(-3);
    const recentHighest = Math.max(...recentScores.map(s => s.score));
    const recentHighestMonth = formatMonth(recentScores.find(s => s.score === recentHighest)?.month || '');
    
    subtitle = `Average: ${averageScore.toFixed(1)} | Recent Highest: ${recentHighest.toFixed(1)} (${recentHighestMonth}) | All-time Highest: ${allTimeHighest.toFixed(1)} (${allTimeHighestMonth})`;
  } else {
    // Just a few data points - show the all-time highest
    subtitle = `Average diversity score: ${averageScore.toFixed(1)} | Highest: ${allTimeHighest.toFixed(1)} (${allTimeHighestMonth})`;
  }

  return (
    <Chart
      id="diversity-score-chart"
      title="Order Diversity Score Over Time"
      subtitle={subtitle}
      type="line"
      data={chartData}
      options={options}
      height="400px"
    />
  );
};

export default DiversityScoreChart;