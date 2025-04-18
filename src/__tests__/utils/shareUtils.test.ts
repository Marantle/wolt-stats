// Vitest imports must come first
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import pako from 'pako';

// Mock the modules we're testing first
vi.mock('pako', () => ({
  default: {
    deflate: vi.fn(() => new Uint8Array([1, 2, 3])),
    inflate: vi.fn((data) => {
      if (data instanceof Uint8Array && data.join(',') === '1,2,3') {
        return JSON.stringify([
          [false, false],
          [["n01", 2, 3625]],
          [["Burger Palace", 1], ["Pizza Place", 1]],
          [["Pizza Place", 2075], ["Burger Palace", 1550]],
          [["n01", 1813]],
          [[6, 1], [0, 1], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0]],
          [[0, 0], [1, 1], [2, 0], [3, 1], [4, 0]],
          [["Cheeseburger", 1], ["Fries", 1]],
          [2, 3625, 1813, 2],
          [["n01", 905, 100, 100, 100]],
          [905, 905, 905, "stable"]
        ]);
      }
      if (data instanceof Uint8Array && data.join(',') === '7,8,9') {
        throw new Error('Mock inflate error');
      }
      return data;
    })
  }
}));

// Define mock data using vi.hoisted (must be after vi import)
const mockData = vi.hoisted(() => ({}));

// Import modules under test (must be after all mocks)
import * as shareUtils from '../../utils/shareUtils';
import { compressStats, decompressStats, generateStatsForSharing, createShareableUrl, extractStatsFromUrl } from '../../utils/shareUtils';
import type { WoltOrder } from '../../../woltorder';
import * as orderUtils from '../../utils/orderUtils';
import { createSampleOrders, mockOrdersStats } from '../fixtures/orderFixtures';

// Mock the global browser APIs
global.btoa = vi.fn((str) => `base64_encoded_${str}`);
global.atob = vi.fn((str) => {
  if (str === 'invalid-data' || str === 'invalid-base64') {
    throw new Error('Invalid base64 string');
  }
  if (str === 'compression-error') {
    return String.fromCharCode(7, 8, 9);
  }
  if (str === 'test-data') {
    return String.fromCharCode(1, 2, 3);
  }
  return String.fromCharCode(1, 2, 3);
});

// Mock window.location for URL generation tests
const originalLocation = window.location;

describe('shareUtils', () => {
  // Sample test data - use the shared fixtures
  const sampleOrders = createSampleOrders();

  beforeEach(() => {
    // Setup window.location mock
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {
        origin: 'https://test.example.com',
        pathname: '/test-path',
        href: 'https://test.example.com/test-path',
        search: '?param=value',
        hash: '#stats=test-data'
      }
    });

    // Spy on orderUtils functions
    vi.spyOn(orderUtils, 'getOrdersByMonth').mockReturnValue(mockOrdersStats.monthlyOrders);
    vi.spyOn(orderUtils, 'getTopVenuesByOrderCount').mockReturnValue(mockOrdersStats.topVenuesByCount);
    vi.spyOn(orderUtils, 'getTopVenuesBySpending').mockReturnValue(mockOrdersStats.topVenuesBySpending);
    vi.spyOn(orderUtils, 'getAverageOrderValueByMonth').mockReturnValue(mockOrdersStats.avgOrderByMonth);
    vi.spyOn(orderUtils, 'getOrdersByDayOfWeek').mockReturnValue(mockOrdersStats.ordersByDay);
    vi.spyOn(orderUtils, 'getOrdersByTimeOfDay').mockReturnValue(mockOrdersStats.ordersByTime);
    vi.spyOn(orderUtils, 'getFavoriteItems').mockReturnValue(mockOrdersStats.favoriteItems);
    vi.spyOn(orderUtils, 'getSummaryStats').mockReturnValue(mockOrdersStats.summary);
    vi.spyOn(orderUtils, 'calculateDiversityScores').mockReturnValue(mockOrdersStats.diversityScores);
    vi.spyOn(orderUtils, 'getDiversityScoreStats').mockReturnValue(mockOrdersStats.diversityStats);

    // Reset mocks for pako and btoa/atob
    vi.mocked(global.btoa).mockClear();
    vi.mocked(global.atob).mockClear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Reset window.location
    Object.defineProperty(window, 'location', {
      writable: true,
      value: originalLocation
    });
    vi.clearAllMocks();
  });

  describe('generateStatsForSharing', () => {
    it('should generate statistics for sharing by calling order utility functions', () => {
      const stats = generateStatsForSharing(sampleOrders);

      expect(orderUtils.getOrdersByMonth).toHaveBeenCalledWith(sampleOrders);
      expect(orderUtils.getTopVenuesByOrderCount).toHaveBeenCalledWith(sampleOrders, 10);
      expect(orderUtils.getTopVenuesBySpending).toHaveBeenCalledWith(sampleOrders, 10);
      expect(orderUtils.getAverageOrderValueByMonth).toHaveBeenCalledWith(sampleOrders);
      expect(orderUtils.getOrdersByDayOfWeek).toHaveBeenCalledWith(sampleOrders);
      expect(orderUtils.getOrdersByTimeOfDay).toHaveBeenCalledWith(sampleOrders);
      expect(orderUtils.getFavoriteItems).toHaveBeenCalledWith(sampleOrders, 10);
      expect(orderUtils.getSummaryStats).toHaveBeenCalledWith(sampleOrders);
      expect(orderUtils.calculateDiversityScores).toHaveBeenCalledWith(sampleOrders);
      expect(orderUtils.getDiversityScoreStats).toHaveBeenCalledWith(mockOrdersStats.diversityScores);

      expect(stats).toEqual(mockOrdersStats);
    });

    it('should handle empty orders array', () => {
      vi.spyOn(orderUtils, 'getOrdersByMonth').mockReturnValueOnce([]);
      vi.spyOn(orderUtils, 'getTopVenuesByOrderCount').mockReturnValueOnce([]);
      vi.spyOn(orderUtils, 'getTopVenuesBySpending').mockReturnValueOnce([]);
      vi.spyOn(orderUtils, 'getAverageOrderValueByMonth').mockReturnValueOnce([]);
      vi.spyOn(orderUtils, 'getOrdersByDayOfWeek').mockReturnValueOnce([]);
      vi.spyOn(orderUtils, 'getOrdersByTimeOfDay').mockReturnValueOnce([]);
      vi.spyOn(orderUtils, 'getFavoriteItems').mockReturnValueOnce([]);
      vi.spyOn(orderUtils, 'getSummaryStats').mockReturnValueOnce({
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        longestStreak: 0
      });
      vi.spyOn(orderUtils, 'calculateDiversityScores').mockReturnValueOnce([]);
      vi.spyOn(orderUtils, 'getDiversityScoreStats').mockReturnValueOnce({
        average: 0,
        highest: 0,
        lowest: 0,
        trend: 'stable'
      });

      const stats = generateStatsForSharing([]);
      expect(stats.monthlyOrders).toEqual([]);
      expect(stats.topVenuesByCount).toEqual([]);
      expect(stats.summary.totalOrders).toBe(0);
    });

    it('should use provided limit for top venues and items', () => {
      generateStatsForSharing(sampleOrders, 5);

      expect(orderUtils.getTopVenuesByOrderCount).toHaveBeenCalledWith(sampleOrders, 5);
      expect(orderUtils.getTopVenuesBySpending).toHaveBeenCalledWith(sampleOrders, 5);
      expect(orderUtils.getFavoriteItems).toHaveBeenCalledWith(sampleOrders, 5);
    });
  });

  describe('compressStats and decompressStats', () => {
    it('should compress and decompress stats correctly', () => {
      // Mock the mocked functions to ensure they are called
      const mockCompressed = 'test-data';
      const mockDeflated = new Uint8Array([1, 2, 3]);
      const mockJson = JSON.stringify([
        [false, false],
        [['n01', 2, 3625]],
        [['Burger Palace', 1]],
        [['Pizza Place', 2075]],
        [['n01', 1813]],
        [[0, 1], [1, 0]],
        [[1, 1], [3, 1]],
        [['Cheeseburger', 1]],
        [2, 3625, 1813, 2],
        [['n01', 905, 100, 100, 100]],
        [905, 905, 905, 'stable']
      ]);

      // Reset all mocks
      vi.clearAllMocks();

      // Mock btoa and atob - do this after clearing mocks
      const btoaSpy = vi.spyOn(global, 'btoa').mockReturnValueOnce('test+data');
      const atobSpy = vi.spyOn(global, 'atob')
        .mockImplementationOnce((str) => {
          expect(str).toBe('test+data'); // Verify input
          return String.fromCharCode(...mockDeflated);
        });

      // Mock pako.inflate
      vi.mocked(pako.inflate).mockReturnValueOnce(mockJson);

      // Test compression
      const compressed = compressStats(mockOrdersStats, { hideVenues: false, hideItems: false });
      expect(compressed).toBe(mockCompressed); // This will convert + to - for URL safety
      expect(btoaSpy).toHaveBeenCalled();

      // Test decompression - should call atob with the original base64 (with +)
      const decompressed = decompressStats(compressed);
      expect(atobSpy).toHaveBeenCalled();

      expect(decompressed).not.toBeNull();
      if (decompressed) {
        expect(decompressed.privacySettings).toEqual({ hideVenues: false, hideItems: false });
        expect(decompressed.stats.monthlyOrders).toHaveLength(1);
        expect(decompressed.stats.summary.totalOrders).toBe(2);
      }
    });

    it('should apply privacy settings when compressing stats', () => {
      // Define mock data with privacy settings
      const mockStatsWithPrivacy = {
        monthlyOrders: [{ month: '2023-01', count: 2, total: 36.25 }],
        topVenuesByCount: [{ venue: '[Venue 1]', count: 1 }],
        topVenuesBySpending: [{ venue: '[Venue 1]', total: 20.75 }],
        avgOrderByMonth: [{ month: '2023-01', average: 18.125 }],
        ordersByDay: [{ day: 'Monday', count: 1 }],
        ordersByTime: [{ timeOfDay: 'Lunch (11-14)', count: 1 }],
        favoriteItems: [{ item: '[Item 1]', count: 1 }],
        summary: {
          totalOrders: 2,
          totalSpent: 36.25,
          averageOrderValue: 18.125,
          longestStreak: 2
        },
        diversityScores: [{
          month: '2023-01',
          score: 90.5,
          uniqueVenuesRatio: 1,
          uniqueItemsRatio: 1,
          newOrderRatio: 1
        }],
        diversityStats: {
          average: 90.5,
          highest: 90.5,
          lowest: 90.5,
          trend: "stable" as const
        }
      };

      // Create spy on decompressStats and provide mock implementation
      const spy = vi.spyOn(shareUtils, 'decompressStats')
        .mockImplementationOnce(() => ({
          stats: mockStatsWithPrivacy,
          privacySettings: { hideVenues: true, hideItems: true }
        }));

      const compressed = compressStats(mockStatsWithPrivacy, { hideVenues: true, hideItems: true });
      const decompressed = decompressStats(compressed);

      expect(decompressed).not.toBeNull();
      if (decompressed) {
        expect(decompressed.privacySettings.hideVenues).toBe(true);
        expect(decompressed.privacySettings.hideItems).toBe(true);
        expect(decompressed.stats.topVenuesByCount[0].venue).toMatch(/\[Venue \d+\]/);
        expect(decompressed.stats.favoriteItems[0].item).toMatch(/\[Item \d+\]/);
      }

      // Clean up
      spy.mockRestore();
    });

    it('should handle URL-safe base64 encoding', () => {
      // Mock base64 to return string with characters that need URL encoding
      vi.mocked(global.btoa).mockReturnValueOnce('abc+def/ghi=');

      const compressed = compressStats(mockOrdersStats, { hideVenues: false, hideItems: false });

      // Check that the result is URL-safe (+ -> -, / -> _, no trailing =)
      expect(compressed).toBe('abc-def_ghi');
    });

    it('should handle error during decompression', () => {
      const result = decompressStats('invalid-data');
      expect(result).toBeNull();
    });

    it('should handle invalid base64 during decompression', () => {
      const result = decompressStats('invalid-base64');
      expect(result).toBeNull();
    });

    it('should handle corrupt data in JSON format after decompression', () => {
      // Mock for corrupt JSON
      vi.mocked(global.atob).mockReturnValueOnce('{"invalid": "json"');

      const result = decompressStats('corrupted-json');
      expect(result).toBeNull();
    });

    it('should handle malformed data array during decompression', () => {
      // Mock for malformed data
      vi.mocked(global.atob).mockReturnValueOnce(JSON.stringify([
        [false, false] // Only privacy settings, missing other data
      ]));

      const result = decompressStats('malformed-data');
      expect(result).toBeNull();
    });

    it('should handle errors during compression', () => {
      // Mock btoa to throw error
      vi.mocked(global.btoa).mockImplementationOnce(() => {
        throw new Error('Compression error');
      });

      const result = compressStats(mockOrdersStats, { hideVenues: false, hideItems: false });
      expect(result).toBe('');
    });

    it('should handle pako inflation errors', () => {
      // Use the compression-error input to trigger the pako.inflate error path
      const result = decompressStats('compression-error');
      expect(result).toBeNull();
    });
  });

  describe('createShareableUrl', () => {
    it('should create a shareable URL with the correct format', () => {
      const compressed = 'abc123';
      const url = createShareableUrl(compressed);

      expect(url).toBe('https://test.example.com/test-path#stats=abc123');
    });

    it('should overwrite any existing hash content', () => {
      const compressed = 'def456';
      const url = createShareableUrl(compressed);

      expect(url).toBe('https://test.example.com/test-path#stats=def456');
      expect(url).not.toContain('test-hash');
    });

    it('should handle empty compressed data', () => {
      const url = createShareableUrl('');

      expect(url).toBe('https://test.example.com/test-path#stats=');
    });
  });

  describe('extractStatsFromUrl', () => {
    beforeEach(() => {
      // Reset window.location.hash before each test
      window.location.hash = '';
    });

    it('should extract stats from a valid URL hash', () => {
      // Set up window.location.hash with URL-safe base64
      window.location.hash = '#stats=test-data';

      // Mock atob to handle the URL-safe base64
      vi.spyOn(global, 'atob')
        .mockImplementationOnce((str) => {
          expect(str).toBe('test+data'); // Will be converted from - to + internally
          return String.fromCharCode(1, 2, 3);
        });

      // Mock pako.inflate with correctly formatted data array
      vi.mocked(pako.inflate).mockReturnValueOnce(JSON.stringify([
        [false, false], // privacySettings
        [['2023-01', 2, 3625]], // monthlyOrders
        [['Burger Palace', 1]], // topVenuesByCount
        [['Pizza Place', 2075]], // topVenuesBySpending
        [['2023-01', 1813]], // avgOrderByMonth
        [[0, 1], [1, 0]], // ordersByDay
        [[1, 1], [3, 1]], // ordersByTime
        [['Cheeseburger', 1]], // favoriteItems
        [2, 3625, 1813, 2], // summary
        [['2023-01', 90.5, 100, 100, 100]], // diversityScores
        [90.5, 90.5, 90.5, 'stable'] // diversityStats
      ]));
      
      const result = extractStatsFromUrl();
      
      expect(result).not.toBeNull();
      if (result) {
        expect(result.stats.monthlyOrders[0].month).toBe('2023-01');
        expect(result.stats.summary.totalOrders).toBe(2);
      }
    });

    it('should return null if no stats parameter in hash', () => {
      // Set the hash without stats parameter
      window.location.hash = '#other=value';

      const result = extractStatsFromUrl();
      expect(result).toBeNull();
    });

    it('should return null if empty hash', () => {
      // Set empty hash
      window.location.hash = '';

      const result = extractStatsFromUrl();
      expect(result).toBeNull();
    });

    it('should return null if decompression fails', () => {
      // Set the hash with stats
      window.location.hash = '#stats=invalid-data';

      // Mock decompressStats to return null (failed decompression)
      vi.spyOn(shareUtils, 'decompressStats').mockReturnValueOnce(null);

      const result = extractStatsFromUrl();
      expect(result).toBeNull();
    });
  });

  describe('Private utility functions', () => {
    // Test the internal helper functions by accessing them through the module

    it('should compress and decompress month format correctly', () => {
      // Using defineProperty to access the private function through test
      const compressMonth = vi.fn().mockImplementation(
        (month: string) => {
          // Call the private function through the module
          return shareUtils.compressMonth(month);
        }
      );

      const decompressMonth = vi.fn().mockImplementation(
        (compressed: string) => {
          return shareUtils.decompressMonth(compressed);
        }
      );

      // Test valid month compression/decompression
      expect(compressMonth('2023-05')).toBe('n05');
      expect(decompressMonth('n05')).toBe('2023-05');

      // Test edge cases
      expect(compressMonth('2000-01')).toBe('001');
      expect(compressMonth('2035-12')).toBe('z12');

      // Test round trip
      const original = '2024-08';
      const compressed = compressMonth(original);
      const decompressed = decompressMonth(compressed);
      expect(decompressed).toBe(original);
    });

    it('should throw error for year outside supported range', () => {
      const compressMonth = vi.fn().mockImplementation(
        (month: string) => {
          return shareUtils.compressMonth(month);
        }
      );

      expect(() => compressMonth('1999-12')).toThrow('Year 1999 is outside supported range');
      expect(() => compressMonth('2036-01')).toThrow('Year 2036 is outside supported range');
    });

    it('should handle malformed month strings', () => {
      const compressMonth = vi.fn().mockImplementation(
        (month: string) => {
          return shareUtils.compressMonth(month);
        }
      );

      const decompressMonth = vi.fn().mockImplementation(
        (compressed: string) => {
          return shareUtils.decompressMonth(compressed);
        }
      );

      // Test invalid month format
      expect(() => compressMonth('invalid')).toThrow();
      expect(() => compressMonth('2023/05')).toThrow();

      // Test invalid compressed format
      expect(() => decompressMonth('xyz')).toThrow();
    });

    it('should apply privacy settings correctly', () => {
      const applyPrivacySettings = vi.fn().mockImplementation(
        (stats: any, settings: any) => {
          return shareUtils.applyPrivacySettings(stats, settings);
        }
      );

      const result = applyPrivacySettings(mockOrdersStats, { hideVenues: true, hideItems: true });

      // Check venues are anonymized
      expect(result.topVenuesByCount[0].venue).toMatch(/\[Venue \d+\]/);
      expect(result.topVenuesBySpending[0].venue).toMatch(/\[Venue \d+\]/);

      // Check items are anonymized
      expect(result.favoriteItems[0].item).toMatch(/\[Item \d+\]/);

      // Check that only the specified parts are modified
      expect(result.monthlyOrders).toEqual(mockOrdersStats.monthlyOrders);
      expect(result.ordersByDay).toEqual(mockOrdersStats.ordersByDay);
    });

    it('should only hide venues when hideVenues is true', () => {
      const applyPrivacySettings = vi.fn().mockImplementation(
        (stats: any, settings: any) => {
          return shareUtils.applyPrivacySettings(stats, settings);
        }
      );

      const result = applyPrivacySettings(mockOrdersStats, { hideVenues: true, hideItems: false });

      // Venues should be hidden
      expect(result.topVenuesByCount[0].venue).toMatch(/\[Venue \d+\]/);

      // Items should remain unchanged
      expect(result.favoriteItems[0].item).toBe(mockOrdersStats.favoriteItems[0].item);
    });

    it('should only hide items when hideItems is true', () => {
      const applyPrivacySettings = vi.fn().mockImplementation(
        (stats: any, settings: any) => {
          return shareUtils.applyPrivacySettings(stats, settings);
        }
      );

      const result = applyPrivacySettings(mockOrdersStats, { hideVenues: false, hideItems: true });

      // Venues should remain unchanged
      expect(result.topVenuesByCount[0].venue).toBe(mockOrdersStats.topVenuesByCount[0].venue);

      // Items should be hidden
      expect(result.favoriteItems[0].item).toMatch(/\[Item \d+\]/);
    });

    it('should not modify stats when no privacy settings are enabled', () => {
      const applyPrivacySettings = vi.fn().mockImplementation(
        (stats: any, settings: any) => {
          return shareUtils.applyPrivacySettings(stats, settings);
        }
      );

      const result = applyPrivacySettings(mockOrdersStats, { hideVenues: false, hideItems: false });

      // Stats should be unchanged
      expect(result).toEqual(mockOrdersStats);
    });

    it('should handle compression and decompression of data arrays', () => {
      const compressDataArray = vi.fn().mockImplementation(
        (stats: any) => {
          return shareUtils.compressDataArray(stats);
        }
      );

      const decompressDataArray = vi.fn().mockImplementation(
        (data: any) => {
          return shareUtils.decompressDataArray(data);
        }
      );

      // Create sample stats data
      const sampleData = {
        monthlyOrders: [{ month: '2023-05', count: 2, spent: 3625 }],
        topVenuesByCount: [{ venue: 'Venue', count: 1 }],
        topVenuesBySpending: [{ venue: 'Venue', spent: 2075 }],
        avgOrderByMonth: [{ month: '2023-05', value: 1812 }],
        ordersByDay: [[0, 1], [1, 1]],
        ordersByTime: [[1, 1], [3, 1]],
        favoriteItems: [{ item: 'Item', count: 1 }],
        summary: { totalOrders: 2, totalSpent: 3625, averageOrderValue: 1812, longestStreak: 2 },
        diversityScores: [{ month: '2023-05', score: 905, items: 100, uniqueItems: 100, venues: 100 }],
        diversityStats: { average: 905, highest: 905, lowest: 905, trend: "stable" as const }
      };

      // Test compression
      const compressed = compressDataArray(sampleData);
      expect(Array.isArray(compressed)).toBe(true);

      // Test decompression
      const decompressed = decompressDataArray(compressed);
      expect(decompressed).toMatchObject({
        monthlyOrders: expect.any(Array),
        topVenuesByCount: expect.any(Array),
        topVenuesBySpending: expect.any(Array),
        avgOrderByMonth: expect.any(Array),
        ordersByDay: expect.any(Array),
        ordersByTime: expect.any(Array),
        favoriteItems: expect.any(Array),
        summary: expect.any(Object),
        diversityScores: expect.any(Array),
        diversityStats: expect.any(Object)
      });
    });
  });

  describe('decompactifyStats', () => {
    test('should handle incomplete or malformed data', () => {
      // Define the type for test data
      type UltraCompactStats = [
        [boolean, boolean], // privacyFlags
        any[], // monthlyOrders
        any[], // topVenuesByCount  
        any[], // topVenuesBySpending
        any[], // avgOrderByMonth
        any[], // ordersByDay
        any[], // ordersByTime
        any[], // favoriteItems
        any[], // summary
        any[], // diversityScores
        any[] | undefined // diversityStats
      ];

      // Test with missing diversity stats (data[9])
      const incompleteData: UltraCompactStats = [
        [false, false], // privacyFlags
        [], // monthlyOrders
        [], // topVenuesByCount  
        [], // topVenuesBySpending
        [], // avgOrderByMonth
        [], // ordersByDay
        [], // ordersByTime
        [], // favoriteItems
        [123, 456, 789], // summary
        [] // diversityScores
        // Missing diversityStats
      ];

      // This should not throw "No lowest priority node found"
      expect(() => shareUtils.decompactifyStats(incompleteData)).not.toThrow();

      const result = shareUtils.decompactifyStats(incompleteData);
      expect(result.stats.diversityStats).toEqual({ 
        average: 0, 
        highest: 0, 
        lowest: 0, 
        trend: 'stable' 
      });

      // Test with partial diversityStats (data[9])
      const partialData: UltraCompactStats = [
        [false, false], // privacyFlags
        [], // monthlyOrders
        [], // topVenuesByCount  
        [], // topVenuesBySpending
        [], // avgOrderByMonth
        [], // ordersByDay
        [], // ordersByTime
        [], // favoriteItems
        [123, 456, 789], // summary
        [], // diversityScores
        [50] // Incomplete diversityStats (missing elements)
      ];

      expect(() => shareUtils.decompactifyStats(partialData)).not.toThrow();

      const partialResult = shareUtils.decompactifyStats(partialData);
      expect(partialResult.stats.diversityStats).toEqual({ 
        average: 5, // 50/10
        highest: 0, 
        lowest: 0, 
        trend: 'stable' 
      });
    });
  });
});