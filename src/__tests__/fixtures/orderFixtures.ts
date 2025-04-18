import type { WoltOrder } from '../../../woltorder';

/**
 * Basic sample orders for general testing purposes
 */
export const createSampleOrders = (): WoltOrder[] => {
  return [
    {
      purchase_id: 'order_1',
      received_at: '15/01/2023, 12:30',
      status: 'delivered',
      venue_name: 'Burger Palace',
      total_amount: '€15.50',
      is_active: true,
      payment_time_ts: 1673789400000,
      main_image: 'image_url',
      items: 'Cheeseburger, Fries, Cola'
    },
    {
      purchase_id: 'order_2',
      received_at: '16/01/2023, 18:45',
      status: 'delivered',
      venue_name: 'Burger Palace',
      total_amount: '€18.90',
      is_active: true,
      payment_time_ts: 1673898300000,
      main_image: 'image_url',
      items: 'Double Cheeseburger, Onion Rings, Milkshake'
    },
    {
      purchase_id: 'order_3',
      received_at: '20/02/2023, 13:15',
      status: 'delivered',
      venue_name: 'Pasta Place',
      total_amount: '€21.75',
      is_active: true,
      payment_time_ts: 1676899500000,
      main_image: 'image_url',
      items: 'Spaghetti Bolognese, Garlic Bread, Tiramisu'
    },
    {
      purchase_id: 'order_4',
      received_at: '21.02.2023 19.30', // Different date format
      status: 'delivered',
      venue_name: 'Sushi Express',
      total_amount: '25,50 €', // Different price format
      is_active: true,
      payment_time_ts: 1676999400000,
      main_image: 'image_url',
      items: 'California Roll, Salmon Nigiri, Miso Soup'
    }
  ] as WoltOrder[];
};

/**
 * Orders fixture with varying diversity levels across months
 */
export const createOrdersWithVaryingDiversity = (): WoltOrder[] => {
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

/**
 * Orders with consistent items across multiple years
 */
export const createMultiYearOrdersWithConsistentItems = (): WoltOrder[] => {
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

/**
 * Real-world like order data with realistic patterns
 */
export const createRealWorldLikeData = (): WoltOrder[] => {
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

/**
 * Test data with consecutive daily orders for streak testing
 */
export const createStreakOrders = (): WoltOrder[] => {
  return [
    {
      purchase_id: 'streak_1',
      received_at: '01/03/2023, 12:00',
      status: 'delivered',
      venue_name: 'Test',
      total_amount: '€10.00',
      is_active: true
    },
    {
      purchase_id: 'streak_2',
      received_at: '02/03/2023, 12:00', // Next day
      status: 'delivered',
      venue_name: 'Test',
      total_amount: '€10.00',
      is_active: true
    },
    {
      purchase_id: 'streak_3',
      received_at: '03/03/2023, 12:00', // Next day
      status: 'delivered',
      venue_name: 'Test',
      total_amount: '€10.00',
      is_active: true
    },
    {
      purchase_id: 'streak_4',
      received_at: '05/03/2023, 12:00', // Gap of one day
      status: 'delivered',
      venue_name: 'Test',
      total_amount: '€10.00',
      is_active: true
    }
  ] as WoltOrder[];
};

/**
 * Orders at different times of day for timeOfDay testing
 */
export const createTimeOfDayOrders = (): WoltOrder[] => {
  return [
    {
      purchase_id: 'time_1',
      received_at: '01/03/2023, 07:00', // Morning
      status: 'delivered',
      venue_name: 'Test',
      total_amount: '€10.00',
      is_active: true
    },
    {
      purchase_id: 'time_2',
      received_at: '01/03/2023, 12:30', // Lunch
      status: 'delivered',
      venue_name: 'Test',
      total_amount: '€10.00',
      is_active: true
    },
    {
      purchase_id: 'time_3',
      received_at: '01/03/2023, 15:00', // Afternoon
      status: 'delivered',
      venue_name: 'Test',
      total_amount: '€10.00',
      is_active: true
    },
    {
      purchase_id: 'time_4',
      received_at: '01/03/2023, 19:00', // Evening
      status: 'delivered',
      venue_name: 'Test',
      total_amount: '€10.00',
      is_active: true
    },
    {
      purchase_id: 'time_5',
      received_at: '01/03/2023, 23:30', // Night
      status: 'delivered',
      venue_name: 'Test',
      total_amount: '€10.00',
      is_active: true
    }
  ] as WoltOrder[];
};

/**
 * Mock order stats data for testing shareUtils
 */
export const mockOrdersStats = {
  monthlyOrders: [
    { month: '2023-01', count: 2, total: 36.25 }
  ],
  topVenuesByCount: [
    { venue: 'Burger Palace', count: 1 },
    { venue: 'Pizza Place', count: 1 }
  ],
  topVenuesBySpending: [
    { venue: 'Pizza Place', total: 20.75 },
    { venue: 'Burger Palace', total: 15.50 }
  ],
  avgOrderByMonth: [
    { month: '2023-01', average: 18.125 }
  ],
  ordersByDay: [
    { day: 'Sunday', count: 1 },
    { day: 'Monday', count: 1 },
    { day: 'Tuesday', count: 0 },
    { day: 'Wednesday', count: 0 },
    { day: 'Thursday', count: 0 },
    { day: 'Friday', count: 0 },
    { day: 'Saturday', count: 0 }
  ],
  ordersByTime: [
    { timeOfDay: 'Morning (6-11)', count: 0 },
    { timeOfDay: 'Lunch (11-14)', count: 1 },
    { timeOfDay: 'Afternoon (14-17)', count: 0 },
    { timeOfDay: 'Evening (17-22)', count: 1 },
    { timeOfDay: 'Night (22-6)', count: 0 }
  ],
  favoriteItems: [
    { item: 'Cheeseburger', count: 1 },
    { item: 'Fries', count: 1 }
  ],
  summary: {
    totalOrders: 2,
    totalSpent: 36.25,
    averageOrderValue: 18.125,
    longestStreak: 2
  },
  diversityScores: [
    { 
      month: '2023-01', 
      score: 90.5, 
      uniqueVenuesRatio: 1,
      uniqueItemsRatio: 1,
      newOrderRatio: 1
    }
  ],
  diversityStats: {
    average: 90.5,
    highest: 90.5,
    lowest: 90.5,
    trend: 'stable' as const
  }
};