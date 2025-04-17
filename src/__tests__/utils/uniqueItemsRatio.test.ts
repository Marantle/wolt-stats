import { describe, it, expect } from 'vitest';
import type { WoltOrder } from '../../../woltorder';
import { calculateDiversityScores } from '../../utils/orderUtils';

describe('Unique Items Ratio Issue', () => {
  const createMultiYearOrdersWithConsistentItems = (): WoltOrder[] => {
    // This creates orders across 3 years where each order has unique items
    // but should not result in 100% unique items ratio
    const years = [2022, 2023, 2024];
    const orders: WoltOrder[] = [];
    
    years.forEach(year => {
      // For each year, create orders for each month
      for (let month = 1; month <= 12; month++) {
        // Create multiple orders per month
        for (let day = 1; day <= 5; day++) {
          // Half the orders will have the same items (should result in ratio < 100%)
          const useRepeatedItems = day <= 2;
          
          orders.push({
            purchase_id: `${year}_${month}_${day}`,
            received_at: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}, 12:00`,
            status: 'delivered',
            venue_name: useRepeatedItems ? 'Regular Venue' : `Venue ${month}_${day}`,
            total_amount: '€15.00',
            is_active: true,
            payment_time_ts: 1677456000000,
            main_image: 'image_url',
            items: useRepeatedItems 
              ? 'Standard Burger, Fries, Cola' // Repeated items
              : `Special Item ${month}_${day}, Side ${day}, Drink ${month}` // Unique items
          } as WoltOrder);
        }
      }
    });
    
    return orders;
  };

  const createRealWorldLikeData = (): WoltOrder[] => {
    // This data is structured to mimic real-world ordering patterns
    // where people might order from the same places and get the same items
    const orders: WoltOrder[] = [];
    
    // Generate 3 years of data with realistic ordering patterns
    const years = [2022, 2023, 2024];
    const monthlyOrderCounts = [3, 4, 5, 4, 5, 6, 5, 4, 3, 4, 5, 6]; // Different counts for each month
    
    // Common venues that appear across all years
    const commonVenues = [
      'Favorite Pizza', 'Burger Place', 'Sushi Express',
      'Thai Delight', 'Salad Bar', 'Sandwich Shop'
    ];
    
    // Common items that people order repeatedly
    const commonItems: Record<string, string[]> = {
      'Favorite Pizza': ['Margherita Pizza', 'Pepperoni Pizza', 'Garlic Bread', 'Tiramisu'],
      'Burger Place': ['Cheeseburger', 'Fries', 'Milkshake', 'Onion Rings'],
      'Sushi Express': ['California Roll', 'Salmon Nigiri', 'Miso Soup', 'Edamame'],
      'Thai Delight': ['Pad Thai', 'Green Curry', 'Spring Rolls', 'Mango Sticky Rice'],
      'Salad Bar': ['Caesar Salad', 'Greek Salad', 'Smoothie', 'Protein Bowl'],
      'Sandwich Shop': ['Turkey Club', 'BLT', 'Chips', 'Cookie']
    };
    
    // Keep track of order ID
    let orderId = 1;
    
    // Generate orders year by year
    years.forEach(year => {
      // For each month
      for (let month = 1; month <= 12; month++) {
        const orderCount = monthlyOrderCounts[month - 1];
        
        // Create the specified number of orders for this month
        for (let i = 0; i < orderCount; i++) {
          // Pick a venue (with some venues being more frequent)
          const venueIndex = Math.floor(Math.pow(Math.random(), 2) * commonVenues.length);
          const venue = commonVenues[venueIndex];
          
          // Get the common items for this venue
          const venueItems = commonItems[venue];
          
          // Select 1-3 items from the venue's menu
          const itemCount = 1 + Math.floor(Math.random() * 3);
          const selectedItems: string[] = [];
          
          for (let j = 0; j < itemCount; j++) {
            // Pick items with some repetition (more likely to pick common items)
            const itemIndex = Math.floor(Math.pow(Math.random(), 1.5) * venueItems.length);
            selectedItems.push(venueItems[itemIndex]);
          }
          
          // Add some variety with occasional special items
          if (Math.random() > 0.7) {
            selectedItems.push(`Special Item ${month}`);
          }
          
          // Create the order
          const day = 1 + Math.floor(Math.random() * 28); // Random day in month
          orders.push({
            purchase_id: `order_${orderId++}`,
            received_at: `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}, 12:00`,
            status: 'delivered',
            venue_name: venue,
            total_amount: `€${(10 + Math.random() * 30).toFixed(2)}`,
            is_active: true,
            payment_time_ts: 1677456000000,
            main_image: 'image_url',
            items: selectedItems.join(', ')
          } as WoltOrder);
        }
      }
    });
    
    return orders;
  };

  it('should not show 100% unique items ratio across years with consistent data', () => {
    const orders = createMultiYearOrdersWithConsistentItems();
    const scores = calculateDiversityScores(orders);
    
    // Group scores by year
    const scoresByYear: Record<string, typeof scores> = {};
    scores.forEach(score => {
      const year = score.month.split('-')[0];
      if (!scoresByYear[year]) {
        scoresByYear[year] = [];
      }
      scoresByYear[year].push(score);
    });
    
    // Check each year's unique items ratios
    Object.entries(scoresByYear).forEach(([year, yearScores]) => {
      // Calculate the average uniqueItemsRatio for the year
      const avgUniqueItemsRatio = yearScores.reduce((sum, score) => sum + score.uniqueItemsRatio, 0) / yearScores.length;
      
      // Count months with 100% uniqueItemsRatio
      const perfect100Count = yearScores.filter(s => s.uniqueItemsRatio >= 0.99).length;
      const perfectRatio = perfect100Count / yearScores.length;
      
      // We expect that with consistent data, not all months should have 100% uniqueItemsRatio
      expect(perfectRatio).toBeLessThan(1.0, 
        `Year ${year} has ${perfect100Count} out of ${yearScores.length} months with ~100% unique items ratio`);
      
      // The average uniqueItemsRatio should be reasonably below 100%
      // given that we created data with repeated items
      expect(avgUniqueItemsRatio).toBeLessThan(0.9, 
        `Year ${year} average unique items ratio is ${(avgUniqueItemsRatio * 100).toFixed(1)}%`);
    });
  });

  it('should correctly handle a mix of repeated and unique items in realistic data', () => {
    const orders = createRealWorldLikeData();
    const scores = calculateDiversityScores(orders);
    
    // Group scores by year
    const scoresByYear: Record<string, typeof scores> = {};
    scores.forEach(score => {
      const year = score.month.split('-')[0];
      if (!scoresByYear[year]) {
        scoresByYear[year] = [];
      }
      scoresByYear[year].push(score);
    });
    
    // Check each year's unique items ratios
    Object.entries(scoresByYear).forEach(([year, yearScores]) => {
      // Calculate the average uniqueItemsRatio for the year
      const avgUniqueItemsRatio = yearScores.reduce((sum, score) => sum + score.uniqueItemsRatio, 0) / yearScores.length;
      
      // With realistic data, we expect variation in the uniqueItemsRatio across months
      const uniqueItemsRatios = yearScores.map(s => s.uniqueItemsRatio);
      const hasVariation = Math.max(...uniqueItemsRatios) - Math.min(...uniqueItemsRatios) > 0.1;
      
      expect(hasVariation).toBe(true, 
        `Year ${year} should have variation in uniqueItemsRatio (current range: ${Math.min(...uniqueItemsRatios).toFixed(2)}-${Math.max(...uniqueItemsRatios).toFixed(2)})`);
      
      // The average should reflect realistic ordering patterns (not all unique)
      expect(avgUniqueItemsRatio).toBeLessThan(0.9, 
        `Year ${year} average unique items ratio is ${(avgUniqueItemsRatio * 100).toFixed(1)}%`);
    });
  });

  it('should correctly calculate unique items ratio when items are repeated within the same month', () => {
    // Create test data for a single month with repeated items
    const orders: WoltOrder[] = [];
    
    // Add 10 orders in the same month
    for (let i = 0; i < 10; i++) {
      orders.push({
        purchase_id: `order_${i}`,
        received_at: `${(i+1).toString().padStart(2, '0')}/01/2023, 12:00`,
        status: 'delivered',
        venue_name: 'Test Venue',
        total_amount: '€15.00',
        is_active: true,
        payment_time_ts: 1677456000000,
        main_image: 'image_url',
        // Every order has the exact same items
        items: 'Burger, Fries, Cola'
      } as WoltOrder);
    }
    
    const scores = calculateDiversityScores(orders);
    
    // We should have one month
    expect(scores).toHaveLength(1);
    
    // For this month, we have 10 orders with the same 3 items in each order
    // If uniqueItemsRatio is calculated correctly (unique items / total item entries),
    // it should be 3 unique items / (10 orders * 3 items) = 3/30 = 0.1
    expect(scores[0].uniqueItemsRatio).toBeLessThan(0.5);
  });

  it('should handle multiple orders with same venue and items in consecutive months', () => {
    // Create test data that mimics a user ordering the same thing from the same place every month
    const orders: WoltOrder[] = [];
    
    // Add one order per month for a year, all with the same venue and items
    for (let month = 1; month <= 12; month++) {
      orders.push({
        purchase_id: `monthly_${month}`,
        received_at: `15/${month.toString().padStart(2, '0')}/2023, 12:00`,
        status: 'delivered',
        venue_name: 'Monthly Favorite',
        total_amount: '€15.00',
        is_active: true,
        payment_time_ts: 1677456000000,
        main_image: 'image_url',
        items: 'Favorite Dish, Side, Drink' // Same items every month
      } as WoltOrder);
    }
    
    const scores = calculateDiversityScores(orders);
    
    // We should have 12 months
    expect(scores).toHaveLength(12);
    
    // Check the trend of newOrderRatio
    // First month should have 1.0 (all new)
    expect(scores[0].newOrderRatio).toBeCloseTo(1.0);
    
    // By the last month, we're ordering the same things repeatedly,
    // so the new order ratio should be much lower
    expect(scores[11].newOrderRatio).toBeCloseTo(0);
    
    // Each month has 1 order with 3 items, which are all unique within that month
    // Since these are the same items each month, the uniqueItemsRatio should reflect
    // whether we're counting items correctly
    scores.forEach((score) => {
      // Each month should have a high uniqueItemsRatio since there's only one order
      // with 3 unique items within that single month
      expect(score.uniqueItemsRatio).toBeGreaterThan(0);
    });
  });
});