import React from 'react';
import type { WoltOrder } from '../../../woltorder';
import { calculateDiversityScores, getDiversityScoreStats, type DiversityScore } from '../../utils/orderUtils';
import StatsCard from './StatsCard';

interface DiversityScoreStatsCardProps {
  orders?: WoltOrder[];
  diversityStats?: {
    average: number;
    highest: number;
    lowest: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  };
}

const DiversityScoreStatsCard: React.FC<DiversityScoreStatsCardProps> = ({ orders, diversityStats }) => {
  // Calculate diversity scores and stats if not provided
  const stats = diversityStats || (orders ? getDiversityScoreStats(calculateDiversityScores(orders)) : {
    average: 0,
    highest: 0,
    lowest: 0,
    trend: 'stable' as const
  });
  
  // Determine color based on trend
  let color: 'blue' | 'green' | 'red' = 'blue';
  let trendIcon = '📊';
  let trendDescription = 'Stable ordering variety';
  
  if (stats.trend === 'increasing') {
    color = 'green';
    trendIcon = '📈';
    trendDescription = 'Increasing ordering variety';
  } else if (stats.trend === 'decreasing') {
    color = 'red';
    trendIcon = '📉';
    trendDescription = 'Decreasing ordering variety';
  }
  
  return (
    <StatsCard
      id="diversity-score-stats"
      title="Order Diversity Score"
      value={`${stats.average}`}
      description={trendDescription}
      icon={trendIcon}
      color={color}
    />
  );
};

export default DiversityScoreStatsCard;