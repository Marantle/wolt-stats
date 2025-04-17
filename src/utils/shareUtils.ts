import type { WoltOrder } from '../../woltorder';
import { getOrdersByMonth, getTopVenuesByOrderCount, getTopVenuesBySpending, 
  getAverageOrderValueByMonth, getOrdersByDayOfWeek, getOrdersByTimeOfDay, 
  getFavoriteItems, getSummaryStats, calculateDiversityScores, getDiversityScoreStats } from './orderUtils';
import pako from 'pako';

interface PrivacySettings {
  hideVenues: boolean;
  hideItems: boolean;
}

interface SharedStats {
  monthlyOrders: ReturnType<typeof getOrdersByMonth>;
  topVenuesByCount: ReturnType<typeof getTopVenuesByOrderCount>;
  topVenuesBySpending: ReturnType<typeof getTopVenuesBySpending>;
  avgOrderByMonth: ReturnType<typeof getAverageOrderValueByMonth>;
  ordersByDay: ReturnType<typeof getOrdersByDayOfWeek>;
  ordersByTime: ReturnType<typeof getOrdersByTimeOfDay>;
  favoriteItems: ReturnType<typeof getFavoriteItems>;
  summary: ReturnType<typeof getSummaryStats>;
  diversityScores: ReturnType<typeof calculateDiversityScores>;
  diversityStats: ReturnType<typeof getDiversityScoreStats>;
}

export interface SharedData {
  stats: SharedStats;
  privacySettings: PrivacySettings;
}

type CompressedDay = [number, number]; // [dayIndex, count]
type CompressedTime = [number, number]; // [timeIndex, count]

// Ultra compact data structure with privacy flags
// [privacyFlags, monthData[], venueCountData[], venueSpendData[], avgData[], dayData[], timeData[], favoritesData[], summaryData, diversityScores[], diversityStats]
type UltraCompactStats = [
  [boolean, boolean], // hideVenues, hideItems
  [string, number, number][], // month (compressed), count, total*100
  [string, number][], // venue, count
  [string, number][], // venue, spending*100
  [string, number][], // month (compressed), average*100
  CompressedDay[], // [dayIndex, count] pairs
  CompressedTime[], // [timeIndex, count] pairs
  [string, number][], // item, count
  number[], // [totalOrders, totalSpent*100, avgOrderValue*100, longestStreak]
  [string, number, number, number, number][], // [month (compressed), score*10, uniqueVenuesRatio*100, uniqueItemsRatio*100, newOrderRatio*100]
  [number, number, number, string] // [average*10, highest*10, lowest*10, trend]
];

const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const timeNames = ['Morning (6-11)', 'Lunch (11-14)', 'Afternoon (14-17)', 'Evening (17-22)', 'Night (22-6)'];

// Compress YYYY-MM format to more compact but safe format
// Uses base36 for year-2000 and keeps 2 digits for month
// e.g. "2017-01" -> "h01" (17 in base36 = 'h')
//      "2024-01" -> "o01" (24 in base36 = 'o')
//      "2030-12" -> "u12" (30 in base36 = 'u')
function compressMonth(month: string): string {
  const [yearStr, m] = month.split('-');
  const year = parseInt(yearStr);
  if (year < 2000 || year > 2035) {
    throw new Error(`Year ${year} is outside supported range (2000-2035)`);
  }
  const yearBase36 = (year - 2000).toString(36); // 0-9, then a-z
  return yearBase36 + m;
}

// Decompress the compact month format back to YYYY-MM
function decompressMonth(compressed: string): string {
  const yearBase36 = compressed.charAt(0);
  const month = compressed.slice(1);
  const year = 2000 + parseInt(yearBase36, 36);
  return `${year}-${month}`;
}

function integerize(num: number): number {
  return Math.round(num * 100);
}

function deintegerize(num: number): number {
  return num / 100;
}

function applyPrivacySettings(stats: SharedStats, settings: PrivacySettings): SharedStats {
  return {
    ...stats,
    topVenuesByCount: settings.hideVenues ? 
      stats.topVenuesByCount.map((item, i) => ({ ...item, venue: `[Venue ${i + 1}]` })) : 
      stats.topVenuesByCount,
    topVenuesBySpending: settings.hideVenues ? 
      stats.topVenuesBySpending.map((item, i) => ({ ...item, venue: `[Venue ${i + 1}]` })) : 
      stats.topVenuesBySpending,
    favoriteItems: settings.hideItems ? 
      stats.favoriteItems.map((item, i) => ({ ...item, item: `[Item ${i + 1}]` })) : 
      stats.favoriteItems
  };
}

function compactifyStats(stats: SharedStats, privacySettings: PrivacySettings): UltraCompactStats {
  // Apply privacy settings before compacting
  const processedStats = applyPrivacySettings(stats, privacySettings);
  
  return [
    [privacySettings.hideVenues, privacySettings.hideItems],
    processedStats.monthlyOrders.map(({ month, count, total }) => 
      [compressMonth(month), count, integerize(total)]),
    processedStats.topVenuesByCount.map(({ venue, count }) => [venue, count]),
    processedStats.topVenuesBySpending.map(({ venue, total }) => [venue, integerize(total)]),
    processedStats.avgOrderByMonth.map(({ month, average }) => 
      [compressMonth(month), integerize(average)]),
    processedStats.ordersByDay.map(({ day, count }) => 
      [dayNames.indexOf(day), count]),
    processedStats.ordersByTime.map(({ timeOfDay, count }) => 
      [timeNames.indexOf(timeOfDay), count]),
    processedStats.favoriteItems.map(({ item, count }) => [item, count]),
    [
      processedStats.summary.totalOrders,
      integerize(processedStats.summary.totalSpent),
      integerize(processedStats.summary.averageOrderValue),
      processedStats.summary.longestStreak
    ],
    processedStats.diversityScores.map(({ month, score, uniqueVenuesRatio, uniqueItemsRatio, newOrderRatio }) => 
      [compressMonth(month), Math.round(score * 10), integerize(uniqueVenuesRatio), 
       integerize(uniqueItemsRatio), integerize(newOrderRatio)]),
    [
      Math.round(processedStats.diversityStats.average * 10),
      Math.round(processedStats.diversityStats.highest * 10),
      Math.round(processedStats.diversityStats.lowest * 10),
      processedStats.diversityStats.trend
    ]
  ];
}

function decompactifyStats(compact: UltraCompactStats): SharedData {
  const [privacyFlags, ...data] = compact;
  return {
    privacySettings: {
      hideVenues: privacyFlags[0],
      hideItems: privacyFlags[1]
    },
    stats: {
      monthlyOrders: data[0].map(([month, count, total]) => ({ 
        month: decompressMonth(month), 
        count, 
        total: deintegerize(total) 
      })),
      topVenuesByCount: data[1].map(([venue, count]) => ({ venue, count })),
      topVenuesBySpending: data[2].map(([venue, total]) => ({ 
        venue, 
        total: deintegerize(total) 
      })),
      avgOrderByMonth: data[3].map(([month, average]) => ({ 
        month: decompressMonth(month), 
        average: deintegerize(average) 
      })),
      ordersByDay: data[4].map(([dayIndex, count]) => ({ 
        day: dayNames[dayIndex], 
        count
      })),
      ordersByTime: data[5].map(([timeIndex, count]) => ({ 
        timeOfDay: timeNames[timeIndex], 
        count
      })),
      favoriteItems: data[6].map(([item, count]) => ({ item, count })),
      summary: {
        totalOrders: data[7][0],
        totalSpent: deintegerize(data[7][1]),
        averageOrderValue: deintegerize(data[7][2]),
        longestStreak: data[7][3]
      },
      diversityScores: data[8] ? data[8].map(([month, score, uniqueVenuesRatio, uniqueItemsRatio, newOrderRatio]) => ({
        month: decompressMonth(month),
        score: score / 10,
        uniqueVenuesRatio: deintegerize(uniqueVenuesRatio),
        uniqueItemsRatio: deintegerize(uniqueItemsRatio),
        newOrderRatio: deintegerize(newOrderRatio)
      })) : [],
      diversityStats: data[9] ? {
        average: data[9][0] / 10,
        highest: data[9][1] / 10,
        lowest: data[9][2] / 10,
        trend: data[9][3] as 'increasing' | 'decreasing' | 'stable'
      } : {
        average: 0,
        highest: 0,
        lowest: 0,
        trend: 'stable'
      }
    }
  };
}

export function compressStats(stats: SharedStats, privacySettings: PrivacySettings): string {
  const compact = compactifyStats(stats, privacySettings);
  const json = JSON.stringify(compact);
  const compressed = pako.deflate(json);
  return btoa(Array.from(compressed).map(byte => String.fromCharCode(byte)).join(''))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decompressStats(compressed: string): SharedData | null {
  try {
    const padded = compressed
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
    const json = pako.inflate(bytes, { to: 'string' });
    const compact = JSON.parse(json) as UltraCompactStats;
    return decompactifyStats(compact);
  } catch (e) {
    console.error('Failed to decompress stats:', e);
    return null;
  }
}

export function generateStatsForSharing(orders: WoltOrder[]): SharedStats {
  const diversityScores = calculateDiversityScores(orders);
  const diversityStats = getDiversityScoreStats(diversityScores);
  
  return {
    monthlyOrders: getOrdersByMonth(orders),
    topVenuesByCount: getTopVenuesByOrderCount(orders, 10),
    topVenuesBySpending: getTopVenuesBySpending(orders, 10),
    avgOrderByMonth: getAverageOrderValueByMonth(orders),
    ordersByDay: getOrdersByDayOfWeek(orders),
    ordersByTime: getOrdersByTimeOfDay(orders),
    favoriteItems: getFavoriteItems(orders, 10),
    summary: getSummaryStats(orders),
    diversityScores,
    diversityStats
  };
}