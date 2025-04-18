import { describe, expect, it } from 'vitest';
import { compressStats, decompressStats, generateStatsForSharing } from '../../../src/utils/shareUtils';
import { mockOrdersStats } from '../fixtures/orderFixtures';
import { createSampleOrders } from '../fixtures/orderFixtures';

describe('shareUtils', () => {
  describe('compressStats', () => {
    it('should compress stats with default privacy settings', () => {
      const compressed = compressStats(mockOrdersStats, { hideVenues: false, hideItems: false });
      expect(compressed).toBeDefined();
      expect(typeof compressed).toBe('string');
      expect(compressed.length).toBeGreaterThan(0);
    });

    it('should compress stats with all privacy settings enabled', () => {
      const compressed = compressStats(mockOrdersStats, { hideVenues: true, hideItems: true });
      expect(compressed).toBeDefined();
      expect(typeof compressed).toBe('string');
      expect(compressed.length).toBeGreaterThan(0);
    });

    it('should handle empty stats', () => {
      const emptyStats = {
        ...mockOrdersStats,
        monthlyOrders: [],
        topVenuesByCount: [],
        topVenuesBySpending: [],
        avgOrderByMonth: [],
        ordersByDay: [],
        ordersByTime: [],
        favoriteItems: [],
        diversityScores: []
      };
      const compressed = compressStats(emptyStats, { hideVenues: false, hideItems: false });
      expect(compressed).toBeDefined();
      expect(typeof compressed).toBe('string');
    });

    it('should handle null values in stats', () => {
      const statsWithNull = {
        ...mockOrdersStats,
        diversityStats: {
          average: 0,
          highest: 0,
          lowest: 0,
          trend: 'stable' as const
        }
      };
      const compressed = compressStats(statsWithNull, { hideVenues: false, hideItems: false });
      expect(compressed).toBeDefined();
      expect(typeof compressed).toBe('string');
    });
  });

  describe('decompressStats', () => {
    it('should decompress stats correctly', () => {
      const compressed = compressStats(mockOrdersStats, { hideVenues: false, hideItems: false });
      const decompressed = decompressStats(compressed);
      expect(decompressed).toBeDefined();
      expect(decompressed?.stats.monthlyOrders.length).toBe(mockOrdersStats.monthlyOrders.length);
      expect(decompressed?.stats.summary.totalOrders).toBe(mockOrdersStats.summary.totalOrders);
    });

    it('should handle privacy settings during decompression', () => {
      const compressed = compressStats(mockOrdersStats, { hideVenues: true, hideItems: true });
      const decompressed = decompressStats(compressed);
      expect(decompressed).toBeDefined();
      expect(decompressed?.privacySettings.hideVenues).toBe(true);
      expect(decompressed?.privacySettings.hideItems).toBe(true);
      // Check if venues are anonymized
      expect(decompressed?.stats.topVenuesByCount[0].venue).toMatch(/\[Venue \d+\]/);
    });

    it('should handle invalid compressed data', () => {
      const result = decompressStats('invalid-data');
      expect(result).toBeNull();
    });

    it('should handle empty compressed data', () => {
      const result = decompressStats('');
      expect(result).toBeNull();
    });

    it('should preserve numerical values accurately', () => {
      const compressed = compressStats(mockOrdersStats, { hideVenues: false, hideItems: false });
      const decompressed = decompressStats(compressed);
      expect(decompressed?.stats.summary.totalSpent).toBeCloseTo(mockOrdersStats.summary.totalSpent, 2);
      expect(decompressed?.stats.summary.averageOrderValue).toBeCloseTo(mockOrdersStats.summary.averageOrderValue, 2);
    });
  });

  describe('generateStatsForSharing', () => {
    it('should generate valid stats from orders', () => {
      const orders = createSampleOrders();
      const stats = generateStatsForSharing(orders);
      expect(stats).toBeDefined();
      expect(stats.monthlyOrders.length).toBeGreaterThan(0);
      expect(stats.summary.totalOrders).toBe(orders.length);
    });

    it('should handle empty orders array', () => {
      const stats = generateStatsForSharing([]);
      expect(stats).toBeDefined();
      expect(stats.monthlyOrders).toHaveLength(0);
      expect(stats.summary.totalOrders).toBe(0);
    });

    it('should calculate diversity scores correctly', () => {
      const orders = createSampleOrders();
      const stats = generateStatsForSharing(orders);
      expect(stats.diversityScores).toBeDefined();
      expect(Array.isArray(stats.diversityScores)).toBe(true);
      expect(stats.diversityStats).toBeDefined();
      expect(typeof stats.diversityStats.average).toBe('number');
    });
  });

  describe('end-to-end sharing flow', () => {
    it('should successfully compress and decompress stats without data loss', () => {
      const orders = createSampleOrders();
      const originalStats = generateStatsForSharing(orders);
      const compressed = compressStats(originalStats, { hideVenues: false, hideItems: false });
      const decompressed = decompressStats(compressed);

      expect(decompressed).toBeDefined();
      expect(decompressed?.stats.summary.totalOrders).toBe(originalStats.summary.totalOrders);
      expect(decompressed?.stats.monthlyOrders.length).toBe(originalStats.monthlyOrders.length);
      expect(decompressed?.stats.diversityStats.average).toBeCloseTo(originalStats.diversityStats.average, 2);
    });

    it('should handle privacy settings in end-to-end flow', () => {
      const orders = createSampleOrders();
      const originalStats = generateStatsForSharing(orders);
      const compressed = compressStats(originalStats, { hideVenues: true, hideItems: true });
      const decompressed = decompressStats(compressed);

      expect(decompressed).toBeDefined();
      expect(decompressed?.privacySettings.hideVenues).toBe(true);
      expect(decompressed?.privacySettings.hideItems).toBe(true);
      // Verify anonymization
      decompressed?.stats.topVenuesByCount.forEach(venue => {
        expect(venue.venue).toMatch(/\[Venue \d+\]/);
      });
      decompressed?.stats.favoriteItems.forEach(item => {
        expect(item.item).toMatch(/\[Item \d+\]/);
      });
    });
  });

  describe('month compression', () => {
    it('should handle edge case years in stats compression', () => {
      const edgeCaseStats = {
        ...mockOrdersStats,
        monthlyOrders: [
          { month: '2000-01', count: 1, total: 10 },
          { month: '2035-12', count: 1, total: 10 }
        ],
        avgOrderByMonth: [
          { month: '2000-01', average: 10 },
          { month: '2035-12', average: 10 }
        ],
        diversityScores: [
          { 
            month: '2000-01', 
            score: 90.5, 
            uniqueVenuesRatio: 1,
            uniqueItemsRatio: 1,
            newOrderRatio: 1
          },
          {
            month: '2035-12',
            score: 90.5,
            uniqueVenuesRatio: 1,
            uniqueItemsRatio: 1,
            newOrderRatio: 1
          }
        ]
      };
      
      const compressed = compressStats(edgeCaseStats, { hideVenues: false, hideItems: false });
      const decompressed = decompressStats(compressed);
      
      expect(decompressed).toBeDefined();
      expect(decompressed?.stats.monthlyOrders[0].month).toBe('2000-01');
      expect(decompressed?.stats.monthlyOrders[1].month).toBe('2035-12');
    });

    it('should throw error for years outside supported range', () => {
      const invalidStats = {
        ...mockOrdersStats,
        monthlyOrders: [
          { month: '1999-12', count: 1, total: 10 }
        ]
      };
      
      expect(() => compressStats(invalidStats, { hideVenues: false, hideItems: false }))
        .toThrow('Year 1999 is outside supported range (2000-2035)');
    });
  });
});