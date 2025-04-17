import { describe, it, expect } from 'vitest';
import type { WoltOrder } from '../../../woltorder';
import { calculateDiversityScores, getDiversityScoreStats } from '../../utils/orderUtils';

describe('Order Diversity Score Calculations', () => {
  // Test data setup
  const createOrdersWithVaryingDiversity = (): WoltOrder[] => {
    // Base order template
    const baseOrder: Partial<WoltOrder> = {
      status: 'delivered',
      total_amount: '€10.00',
      is_active: true,
      payment_time_ts: 1677456000000, // Some timestamp
      main_image: 'image_url',
    };

    // Create orders across multiple months with varying levels of diversity
    const orders: WoltOrder[] = [
      // January 2023 - High diversity month (many different venues and items)
      ...Array(10).fill(null).map((_, i) => ({
        ...baseOrder,
        purchase_id: `jan_${i}`,
        received_at: `15/01/2023, ${10 + i}:00`, // Different times on Jan 15, 2023
        venue_name: `Venue ${i}`, // 10 different venues
        items: `Item ${i}, Special ${i}`, // Each order has unique items
      } as WoltOrder)),

      // February 2023 - Medium diversity (fewer unique venues, more repeated items)
      ...Array(10).fill(null).map((_, i) => ({
        ...baseOrder,
        purchase_id: `feb_${i}`,
        received_at: `15/02/2023, ${10 + i}:00`, // Different times on Feb 15, 2023
        venue_name: `Venue ${i % 5}`, // Only 5 unique venues (more repeats)
        items: `Item ${i % 3}, Side ${i % 2}`, // More repetition in items
      } as WoltOrder)),

      // March 2023 - Low diversity (mostly same venue and items)
      ...Array(10).fill(null).map((_, i) => ({
        ...baseOrder,
        purchase_id: `mar_${i}`,
        received_at: `15/03/2023, ${10 + i}:00`, // Different times on Mar 15, 2023
        venue_name: `Venue 1`, // All from the same venue
        items: `Item 1, Side 1`, // All the same items
      } as WoltOrder)),
    ];

    return orders;
  };
  
  it('should calculate different diversity scores based on venue and item variety', () => {
    const orders = createOrdersWithVaryingDiversity();
    const scores = calculateDiversityScores(orders);
    
    expect(scores).toHaveLength(3); // Three months
    
    // Ensure months are in chronological order
    expect(scores[0].month).toBe('2023-01');
    expect(scores[1].month).toBe('2023-02');
    expect(scores[2].month).toBe('2023-03');
    
    // January should have highest score (highest diversity)
    expect(scores[0].score).toBeGreaterThan(scores[1].score);
    // March should have lowest score (lowest diversity)
    expect(scores[2].score).toBeLessThan(scores[1].score);
    
    // Check that all scores are within 0-100 range
    scores.forEach(score => {
      expect(score.score).toBeGreaterThanOrEqual(0);
      expect(score.score).toBeLessThanOrEqual(100);
    });
  });
  
  it('should correctly calculate ratios for unique venues', () => {
    const orders = createOrdersWithVaryingDiversity();
    const scores = calculateDiversityScores(orders);
    
    // January: 10 unique venues / 10 orders = 1.0
    expect(scores[0].uniqueVenuesRatio).toBeCloseTo(1.0);
    
    // February: 5 unique venues / 10 orders = 0.5
    expect(scores[1].uniqueVenuesRatio).toBeCloseTo(0.5);
    
    // March: 1 unique venue / 10 orders = 0.1
    expect(scores[2].uniqueVenuesRatio).toBeCloseTo(0.1);
  });
  
  it('should correctly calculate ratios for unique items', () => {
    const orders = createOrdersWithVaryingDiversity();
    const scores = calculateDiversityScores(orders);
    
    // All ratios should be <= 1.0
    scores.forEach(score => {
      expect(score.uniqueItemsRatio).toBeLessThanOrEqual(1.0);
    });
    
    // January should have higher uniqueItemsRatio than March (more diverse)
    expect(scores[0].uniqueItemsRatio).toBeGreaterThan(scores[2].uniqueItemsRatio);
  });
  
  it('should handle the "new order ratio" calculation correctly', () => {
    const orders = createOrdersWithVaryingDiversity();
    const scores = calculateDiversityScores(orders);
    
    // First month should have highest new order ratio (all venues and items are new)
    expect(scores[0].newOrderRatio).toBeCloseTo(1.0);
    
    // Later months should have lower new order ratios as venues and items are repeated
    expect(scores[1].newOrderRatio).toBeLessThan(scores[0].newOrderRatio);
    expect(scores[2].newOrderRatio).toBeLessThan(scores[1].newOrderRatio);
  });
  
  it('should calculate accurate diversity statistics', () => {
    const orders = createOrdersWithVaryingDiversity();
    const scores = calculateDiversityScores(orders);
    const stats = getDiversityScoreStats(scores);
    
    // Check that statistics are calculated correctly
    expect(stats.average).toBeGreaterThan(0);
    expect(stats.highest).toBeGreaterThan(stats.average);
    expect(stats.lowest).toBeLessThan(stats.average);
    
    // Since our test data has decreasing diversity over time,
    // the trend should be 'decreasing'
    expect(stats.trend).toBe('decreasing');
  });
  
  it('should handle empty order arrays gracefully', () => {
    const scores = calculateDiversityScores([]);
    expect(scores).toHaveLength(0);
    
    const stats = getDiversityScoreStats([]);
    expect(stats).toEqual({
      average: 0,
      highest: 0,
      lowest: 0,
      trend: 'stable'
    });
  });
});