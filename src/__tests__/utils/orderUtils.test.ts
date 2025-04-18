import { describe, expect, it } from 'vitest';
import {
  parseOrderDate,
  extractPrice,
  formatCurrency,
  formatMonth,
  getOrdersByMonth,
  getTopVenuesByOrderCount,
  getTopVenuesBySpending,
  getAverageOrderValueByMonth,
  getTotalSpent,
  getOrdersByDayOfWeek,
  getFavoriteItems,
  getLongestOrderStreak,
  getOrdersForHeatmap,
  getOrdersByTimeOfDay,
  getMonthlyUniqueItems,
  getSummaryStats,
  calculateDiversityScores,
  getDiversityScoreStats
} from '../../../src/utils/orderUtils';
import {
  createSampleOrders,
  createTimeOfDayOrders,
  createStreakOrders,
  createOrdersWithVaryingDiversity,
  createMultiYearOrdersWithConsistentItems,
  createRealWorldLikeData
} from '../fixtures/orderFixtures';

describe('orderUtils', () => {
  describe('Date and Price Utils', () => {
    it('should parse dates in dd/mm/yyyy, hh:mm format', () => {
      const date = parseOrderDate('15/01/2023, 12:30');
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(0); // January is 0
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(12);
      expect(date.getMinutes()).toBe(30);
    });

    it('should parse dates in dd.mm.yyyy hh.mm format', () => {
      const date = parseOrderDate('15.01.2023 12.30');
      expect(date.getFullYear()).toBe(2023);
      expect(date.getMonth()).toBe(0);
      expect(date.getDate()).toBe(15);
      expect(date.getHours()).toBe(12);
      expect(date.getMinutes()).toBe(30);
    });

    it('should extract price from €xx.xx format', () => {
      expect(extractPrice('€15.50')).toBe(15.50);
      expect(extractPrice('€0.99')).toBe(0.99);
    });

    it('should extract price from xx,xx € format', () => {
      expect(extractPrice('15,50 €')).toBe(15.50);
      expect(extractPrice('0,99 €')).toBe(0.99);
    });

    it('should handle "--" as zero price', () => {
      expect(extractPrice('--')).toBe(0);
    });

    it('should format currency correctly', () => {
      expect(formatCurrency(15.5)).toBe('€15.50');
      expect(formatCurrency(0.99)).toBe('€0.99');
    });

    it('should format month strings correctly', () => {
      expect(formatMonth('2023-01')).toMatch(/Jan 2023/i);
      expect(formatMonth('2023-12')).toMatch(/Dec 2023/i);
    });
  });

  describe('Order Analysis', () => {
    it('should calculate orders by month', () => {
      const orders = createSampleOrders();
      const monthlyOrders = getOrdersByMonth(orders);
      expect(monthlyOrders.length).toBeGreaterThan(0);
      expect(monthlyOrders[0]).toHaveProperty('month');
      expect(monthlyOrders[0]).toHaveProperty('count');
      expect(monthlyOrders[0]).toHaveProperty('total');
    });

    it('should get top venues by order count', () => {
      const orders = createSampleOrders();
      const topVenues = getTopVenuesByOrderCount(orders, 5);
      expect(topVenues.length).toBeLessThanOrEqual(5);
      expect(topVenues[0]).toHaveProperty('venue');
      expect(topVenues[0]).toHaveProperty('count');
    });

    it('should get top venues by spending', () => {
      const orders = createSampleOrders();
      const topVenues = getTopVenuesBySpending(orders, 5);
      expect(topVenues.length).toBeLessThanOrEqual(5);
      expect(topVenues[0]).toHaveProperty('venue');
      expect(topVenues[0]).toHaveProperty('total');
    });

    it('should calculate average order value by month', () => {
      const orders = createSampleOrders();
      const avgOrders = getAverageOrderValueByMonth(orders);
      expect(avgOrders.length).toBeGreaterThan(0);
      expect(avgOrders[0]).toHaveProperty('month');
      expect(avgOrders[0]).toHaveProperty('average');
    });

    it('should calculate total spent', () => {
      const orders = createSampleOrders();
      const total = getTotalSpent(orders);
      expect(total).toBeGreaterThan(0);
    });
  });

  describe('Time-based Analysis', () => {
    it('should analyze orders by day of week', () => {
      const orders = createSampleOrders();
      const dayOrders = getOrdersByDayOfWeek(orders);
      expect(dayOrders.length).toBe(7); // All days of week
      expect(dayOrders[0]).toHaveProperty('day');
      expect(dayOrders[0]).toHaveProperty('count');
    });

    it('should analyze orders by time of day', () => {
      const orders = createTimeOfDayOrders();
      const timeOrders = getOrdersByTimeOfDay(orders);
      expect(timeOrders.length).toBe(5); // All time categories
      expect(timeOrders.some(o => o.count > 0)).toBe(true);
    });

    it('should calculate longest order streak', () => {
      const orders = createStreakOrders();
      const streak = getLongestOrderStreak(orders);
      expect(streak).toBe(3); // Based on fixture data
    });

    it('should handle empty orders for streak calculation', () => {
      expect(getLongestOrderStreak([])).toBe(0);
    });

    it('should generate heatmap data', () => {
      const orders = createSampleOrders();
      const heatmap = getOrdersForHeatmap(orders);
      expect(Object.keys(heatmap).length).toBeGreaterThan(0);
    });
  });

  describe('Item Analysis', () => {
    it('should get favorite items', () => {
      const orders = createSampleOrders();
      const favorites = getFavoriteItems(orders, 5);
      expect(favorites.length).toBeLessThanOrEqual(5);
      expect(favorites[0]).toHaveProperty('item');
      expect(favorites[0]).toHaveProperty('count');
    });

    it('should handle orders without items', () => {
      const orders = [{ ...createSampleOrders()[0], items: '' }];
      const favorites = getFavoriteItems(orders);
      expect(favorites).toHaveLength(0);
    });

    it('should get monthly unique items', () => {
      const orders = createSampleOrders();
      const monthlyItems = getMonthlyUniqueItems(orders);
      expect(monthlyItems.length).toBeGreaterThan(0);
      expect(monthlyItems[0]).toHaveProperty('month');
      expect(monthlyItems[0]).toHaveProperty('count');
    });
  });

  describe('Summary Statistics', () => {
    it('should calculate summary stats', () => {
      const orders = createSampleOrders();
      const stats = getSummaryStats(orders);
      expect(stats).toHaveProperty('totalOrders');
      expect(stats).toHaveProperty('totalSpent');
      expect(stats).toHaveProperty('averageOrderValue');
      expect(stats).toHaveProperty('longestStreak');
    });

    it('should handle empty orders for summary stats', () => {
      const stats = getSummaryStats([]);
      expect(stats.totalOrders).toBe(0);
      expect(stats.totalSpent).toBe(0);
      expect(stats.averageOrderValue).toBe(0);
      expect(stats.longestStreak).toBe(0);
    });
  });

  describe('Diversity Score Calculations', () => {
    it('should calculate diversity scores', () => {
      const orders = createOrdersWithVaryingDiversity();
      const scores = calculateDiversityScores(orders);
      expect(scores.length).toBeGreaterThan(0);
      expect(scores[0]).toHaveProperty('month');
      expect(scores[0]).toHaveProperty('score');
      expect(scores[0]).toHaveProperty('uniqueVenuesRatio');
      expect(scores[0]).toHaveProperty('uniqueItemsRatio');
      expect(scores[0]).toHaveProperty('newOrderRatio');
    });

    it('should identify trends in diversity scores', () => {
      const orders = createOrdersWithVaryingDiversity();
      const scores = calculateDiversityScores(orders);
      const stats = getDiversityScoreStats(scores);
      expect(stats).toHaveProperty('average');
      expect(stats).toHaveProperty('highest');
      expect(stats).toHaveProperty('lowest');
      expect(stats).toHaveProperty('trend');
    });

    it('should handle empty orders for diversity stats', () => {
      const stats = getDiversityScoreStats([]);
      expect(stats.average).toBe(0);
      expect(stats.highest).toBe(0);
      expect(stats.lowest).toBe(0);
      expect(stats.trend).toBe('stable');
    });

    it('should detect increasing trend', () => {
      const scores = [
        { month: '2023-01', score: 50, uniqueVenuesRatio: 0.5, uniqueItemsRatio: 0.5, newOrderRatio: 0.5 },
        { month: '2023-02', score: 60, uniqueVenuesRatio: 0.6, uniqueItemsRatio: 0.6, newOrderRatio: 0.6 },
        { month: '2023-03', score: 70, uniqueVenuesRatio: 0.7, uniqueItemsRatio: 0.7, newOrderRatio: 0.7 }
      ];
      const stats = getDiversityScoreStats(scores);
      expect(stats.trend).toBe('increasing');
    });

    it('should detect decreasing trend', () => {
      const scores = [
        { month: '2023-01', score: 70, uniqueVenuesRatio: 0.7, uniqueItemsRatio: 0.7, newOrderRatio: 0.7 },
        { month: '2023-02', score: 60, uniqueVenuesRatio: 0.6, uniqueItemsRatio: 0.6, newOrderRatio: 0.6 },
        { month: '2023-03', score: 50, uniqueVenuesRatio: 0.5, uniqueItemsRatio: 0.5, newOrderRatio: 0.5 }
      ];
      const stats = getDiversityScoreStats(scores);
      expect(stats.trend).toBe('decreasing');
    });
  });

  describe('Edge Cases', () => {
    it('should handle single order', () => {
      const orders = [createSampleOrders()[0]];
      expect(() => {
        getOrdersByMonth(orders);
        getTopVenuesByOrderCount(orders);
        getTopVenuesBySpending(orders);
        getAverageOrderValueByMonth(orders);
        getOrdersByDayOfWeek(orders);
        getFavoriteItems(orders);
        getLongestOrderStreak(orders);
        calculateDiversityScores(orders);
      }).not.toThrow();
    });

    it('should handle orders with special characters in venue names', () => {
      const orderWithSpecialChars = {
        ...createSampleOrders()[0],
        venue_name: "McDonald's & Café"
      };
      expect(() => getTopVenuesByOrderCount([orderWithSpecialChars])).not.toThrow();
    });

    it('should handle orders with missing or invalid dates', () => {
      const invalidOrder = {
        ...createSampleOrders()[0],
        received_at: ''
      };
      expect(() => parseOrderDate(invalidOrder.received_at)).toThrow();
    });

    it('should handle long-term data analysis', () => {
      const orders = createMultiYearOrdersWithConsistentItems();
      const scores = calculateDiversityScores(orders);
      expect(scores.length).toBeGreaterThan(0);
    });

    it('should handle real-world like data patterns', () => {
      const orders = createRealWorldLikeData();
      expect(() => {
        const monthlyOrders = getOrdersByMonth(orders);
        const topVenues = getTopVenuesByOrderCount(orders);
        const diversityScores = calculateDiversityScores(orders);
        expect(monthlyOrders.length).toBeGreaterThan(0);
        expect(topVenues.length).toBeGreaterThan(0);
        expect(diversityScores.length).toBeGreaterThan(0);
      }).not.toThrow();
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle orders with extreme dates', () => {
      const orders = [
        {
          ...createSampleOrders()[0],
          received_at: '01/01/2000, 00:00'
        },
        {
          ...createSampleOrders()[0],
          received_at: '31/12/2035, 23:59'
        }
      ];
      expect(() => getOrdersByMonth(orders)).not.toThrow();
    });

    it('should handle orders with zero prices', () => {
      const orders = [
        {
          ...createSampleOrders()[0],
          total_amount: '€0.00'
        }
      ];
      const total = getTotalSpent(orders);
      expect(total).toBe(0);
    });

    it('should handle orders with varying item formats', () => {
      const orders = [
        {
          ...createSampleOrders()[0],
          items: 'Single Item'
        },
        {
          ...createSampleOrders()[0],
          items: 'Item 1, Item 2, Pakkausmateriaali'
        },
        {
          ...createSampleOrders()[0],
          items: '  Trimmed Item  ,  Another Item  '
        }
      ];
      const favorites = getFavoriteItems(orders);
      expect(favorites.some(f => f.item === 'Single Item')).toBe(true);
      expect(favorites.some(f => f.item === 'Pakkausmateriaali')).toBe(false);
      expect(favorites.some(f => f.item === 'Trimmed Item')).toBe(true);
    });

    it('should handle diversity calculations with sparse data', () => {
      const sparseOrders = [
        {
          ...createSampleOrders()[0],
          received_at: '01/01/2023, 12:00'
        },
        {
          ...createSampleOrders()[0],
          received_at: '01/03/2023, 12:00' // Skip February
        }
      ];
      const scores = calculateDiversityScores(sparseOrders);
      expect(scores.length).toBe(2);
    });

    it('should handle diversity trend with exactly two months', () => {
      const twoMonthOrders = [
        {
          ...createSampleOrders()[0],
          received_at: '01/01/2023, 12:00'
        },
        {
          ...createSampleOrders()[0],
          received_at: '01/02/2023, 12:00'
        }
      ];
      const scores = calculateDiversityScores(twoMonthOrders);
      const stats = getDiversityScoreStats(scores);
      expect(stats.trend).toBe('stable');
    });

    it('should handle case where all orders are from same venue', () => {
      const sameVenueOrders = createSampleOrders().map(order => ({
        ...order,
        venue_name: 'Same Venue'
      }));
      const diversityScores = calculateDiversityScores(sameVenueOrders);
      expect(diversityScores[0].uniqueVenuesRatio).toBeLessThanOrEqual(1);
    });
  });
});