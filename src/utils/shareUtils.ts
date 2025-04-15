import type { WoltOrder } from '../../woltorder';
import { getOrdersByMonth, getTopVenuesByOrderCount, getTopVenuesBySpending, 
  getAverageOrderValueByMonth, getOrdersByDayOfWeek, getOrdersByTimeOfDay, 
  getFavoriteItems, getSummaryStats } from './orderUtils';

interface SharedStats {
  monthlyOrders: ReturnType<typeof getOrdersByMonth>;
  topVenuesByCount: ReturnType<typeof getTopVenuesByOrderCount>;
  topVenuesBySpending: ReturnType<typeof getTopVenuesBySpending>;
  avgOrderByMonth: ReturnType<typeof getAverageOrderValueByMonth>;
  ordersByDay: ReturnType<typeof getOrdersByDayOfWeek>;
  ordersByTime: ReturnType<typeof getOrdersByTimeOfDay>;
  favoriteItems: ReturnType<typeof getFavoriteItems>;
  summary: ReturnType<typeof getSummaryStats>;
}

export function generateStatsForSharing(orders: WoltOrder[]): SharedStats {
  return {
    monthlyOrders: getOrdersByMonth(orders),
    topVenuesByCount: getTopVenuesByOrderCount(orders, 10),
    topVenuesBySpending: getTopVenuesBySpending(orders, 10),
    avgOrderByMonth: getAverageOrderValueByMonth(orders),
    ordersByDay: getOrdersByDayOfWeek(orders),
    ordersByTime: getOrdersByTimeOfDay(orders),
    favoriteItems: getFavoriteItems(orders, 10),
    summary: getSummaryStats(orders)
  };
}

export function compressStats(stats: SharedStats): string {
  const json = JSON.stringify(stats);
  // Using built-in compression API
  return btoa(json)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export function decompressStats(compressed: string): SharedStats | null {
  try {
    const padded = compressed
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const json = atob(padded);
    return JSON.parse(json) as SharedStats;
  } catch (e) {
    console.error('Failed to decompress stats:', e);
    return null;
  }
}