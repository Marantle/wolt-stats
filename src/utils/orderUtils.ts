import type { WoltOrder } from '../../woltorder';

// Helper function to parse the date from formats "dd/mm/yyyy, hh:mm" or "dd.mm.yyyy hh.mm"
export function parseOrderDate(dateString: string): Date {
  // Handle both separator types
  const [datePart, timePart] = dateString.includes(',')
    ? dateString.split(', ')
    : dateString.split(' ');

  // Handle both date separator types (. or /)
  const [day, month, year] = datePart.split(/[./]/).map(Number);

  // Handle both time separator types (: or .)
  const [hours, minutes] = timePart.split(/[.:]/).map(Number);

  return new Date(year, month - 1, day, hours, minutes);
}

// Function to extract the numeric value from price strings "€xx.xx" or "xx,xx €"
export function extractPrice(priceString: string): number {
  if (priceString === '--') return 0;

  // Remove any whitespace
  const cleaned = priceString.trim();

  // Handle both formats
  if (cleaned.startsWith('€')) {
    // Format: €xx.xx
    return parseFloat(cleaned.replace('€', ''));
  } else {
    // Format: xx,xx €
    return parseFloat(cleaned.replace(' €', '').replace(',', '.'));
  }
}

// Format monetary values
export function formatCurrency(value: number): string {
  return `€${value.toFixed(2)}`;
}

// Format month for display
export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
}

// Get orders by month
export function getOrdersByMonth(orders: WoltOrder[]): { month: string; count: number; total: number }[] {
  const monthlyOrders: Record<string, { count: number; total: number }> = {};

  orders.forEach(order => {
    const date = parseOrderDate(order.received_at);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    const monthlyData = monthlyOrders[monthKey] || { count: 0, total: 0 };

    monthlyData.count += 1;
    monthlyData.total += extractPrice(order.total_amount);

    monthlyOrders[monthKey] = monthlyData;
  });

  return Object.entries(monthlyOrders)
    .map(([month, data]) => ({
      month,
      count: data.count,
      total: data.total
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// Get top venues by order count
export function getTopVenuesByOrderCount(orders: WoltOrder[], limit: number = 10): { venue: string; count: number }[] {
  const venueCount: Record<string, number> = {};

  orders.forEach(order => {
    venueCount[order.venue_name] = (venueCount[order.venue_name] || 0) + 1;
  });

  return Object.entries(venueCount)
    .map(([venue, count]) => ({ venue, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// Get top venues by total spent
export function getTopVenuesBySpending(orders: WoltOrder[], limit: number = 10): { venue: string; total: number }[] {
  const venueSpending: Record<string, number> = {};

  orders.forEach(order => {
    const amount = extractPrice(order.total_amount);
    venueSpending[order.venue_name] = (venueSpending[order.venue_name] || 0) + amount;
  });

  return Object.entries(venueSpending)
    .map(([venue, total]) => ({ venue, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

// Get average order value over time (monthly)
export function getAverageOrderValueByMonth(orders: WoltOrder[]): { month: string; average: number }[] {
  const monthlyOrders = getOrdersByMonth(orders);

  return monthlyOrders.map(({ month, count, total }) => ({
    month,
    average: count > 0 ? total / count : 0
  }));
}

// Get total spent all time
export function getTotalSpent(orders: WoltOrder[]): number {
  return orders.reduce((sum, order) => sum + extractPrice(order.total_amount), 0);
}

// Get order distribution by day of week
export function getOrdersByDayOfWeek(orders: WoltOrder[]): { day: string; count: number }[] {
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayCount = Array(7).fill(0);

  orders.forEach(order => {
    const date = parseOrderDate(order.received_at);
    let dayOfWeek = date.getDay(); // 0-6, starting with Sunday
    dayOfWeek = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday-based (0-6)
    dayCount[dayOfWeek]++;
  });

  return dayNames.map((day, index) => ({
    day,
    count: dayCount[index]
  }));
}

// Get favorite items
export function getFavoriteItems(orders: WoltOrder[], limit: number = 10): { item: string; count: number }[] {
  const itemCount: Record<string, number> = {};

  orders.forEach(order => {
    if (!order.items) return;

    const items = order.items.split(', ');
    items.forEach(item => {
      const trimmedItem = item.trim();
      if (trimmedItem && !trimmedItem.includes('Pakkausmateriaali')) {
        itemCount[trimmedItem] = (itemCount[trimmedItem] || 0) + 1;
      }
    });
  });

  return Object.entries(itemCount)
    .map(([item, count]) => ({ item, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// Get the longest streak of consecutive days with orders
export function getLongestOrderStreak(orders: WoltOrder[]): number {
  if (orders.length === 0) return 0;

  // Create a Set of all dates with orders (in YYYY-MM-DD format)
  const orderDates = new Set<string>();
  orders.forEach(order => {
    const date = parseOrderDate(order.received_at);
    orderDates.add(`${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`);
  });

  // Convert to array, sort, and calculate longest streak
  const sortedDates = Array.from(orderDates).sort();
  let currentStreak = 1;
  let longestStreak = 1;

  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);

    // Check if dates are consecutive
    prevDate.setDate(prevDate.getDate() + 1);
    if (prevDate.getTime() === currDate.getTime()) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}

// Get order data for calendar heatmap
export function getOrdersForHeatmap(orders: WoltOrder[]): Record<string, number> {
  const orderCounts: Record<string, number> = {};

  orders.forEach(order => {
    const date = parseOrderDate(order.received_at);
    const dateKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

    orderCounts[dateKey] = (orderCounts[dateKey] || 0) + 1;
  });

  return orderCounts;
}

// Get order distribution by time of day
export function getOrdersByTimeOfDay(orders: WoltOrder[]): { timeOfDay: string; count: number }[] {
  const timeCategories = [
    { name: 'Morning (6-11)', count: 0 },
    { name: 'Lunch (11-14)', count: 0 },
    { name: 'Afternoon (14-17)', count: 0 },
    { name: 'Evening (17-22)', count: 0 },
    { name: 'Night (22-6)', count: 0 }
  ];

  orders.forEach(order => {
    const date = parseOrderDate(order.received_at);
    const hour = date.getHours();

    if (hour >= 6 && hour < 11) {
      timeCategories[0].count++;
    } else if (hour >= 11 && hour < 14) {
      timeCategories[1].count++;
    } else if (hour >= 14 && hour < 17) {
      timeCategories[2].count++;
    } else if (hour >= 17 && hour < 22) {
      timeCategories[3].count++;
    } else {
      timeCategories[4].count++;
    }
  });

  return timeCategories.map(({ name, count }) => ({
    timeOfDay: name,
    count
  }));
}

// Get monthly unique items
export function getMonthlyUniqueItems(orders: WoltOrder[]): { month: string; count: number }[] {
  const monthlyItems: Record<string, Set<string>> = {};

  orders.forEach(order => {
    if (!order.items) return;

    const date = parseOrderDate(order.received_at);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    if (!monthlyItems[monthKey]) {
      monthlyItems[monthKey] = new Set<string>();
    }

    const items = order.items.split(', ');
    items.forEach(item => {
      const trimmedItem = item.trim();
      if (trimmedItem && !trimmedItem.includes('Pakkausmateriaali')) {
        monthlyItems[monthKey].add(trimmedItem);
      }
    });
  });

  return Object.entries(monthlyItems)
    .map(([month, items]) => ({
      month,
      count: items.size
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// Calculate summary statistics from orders
export function getSummaryStats(orders: WoltOrder[]) {
  const totalOrders = orders.length;
  const totalSpent = getTotalSpent(orders);
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
  const longestStreak = getLongestOrderStreak(orders);

  return {
    totalOrders,
    totalSpent,
    averageOrderValue,
    longestStreak
  };
}

// Order Diversity Score Types
export interface DiversityScore {
  month: string;
  score: number;
  uniqueVenuesRatio: number;
  uniqueItemsRatio: number;
  newOrderRatio: number;
}

// Calculate monthly order diversity scores
export function calculateDiversityScores(orders: WoltOrder[]): DiversityScore[] {
  // Group orders by month
  const ordersByMonth: Record<string, WoltOrder[]> = {};
  
  orders.forEach(order => {
    const date = parseOrderDate(order.received_at);
    const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    
    if (!ordersByMonth[monthKey]) {
      ordersByMonth[monthKey] = [];
    }
    
    ordersByMonth[monthKey].push(order);
  });

  // Create a set of all venues and items seen so far for calculating "new" orders
  const historicalVenues = new Set<string>();
  const historicalItems = new Set<string>();
  
  // Sort months chronologically
  const sortedMonths = Object.keys(ordersByMonth).sort();
  
  // Calculate diversity scores for each month
  return sortedMonths.map(month => {
    const monthOrders = ordersByMonth[month];
    
    // Count unique venues in this month
    const monthVenues = new Set<string>();
    monthOrders.forEach(order => monthVenues.add(order.venue_name));
    
    // Count unique items in this month and total item entries
    const monthItems = new Set<string>();
    let totalItemEntries = 0; // Track total item entries, not just orders
    
    monthOrders.forEach(order => {
      if (!order.items) return;
      const items = order.items.split(', ');
      items.forEach(item => {
        const trimmedItem = item.trim();
        if (trimmedItem && !trimmedItem.includes('Pakkausmateriaali')) {
          monthItems.add(trimmedItem);
          totalItemEntries++; // Count each item entry
        }
      });
    });
    
    // Calculate number of new venues and items (not seen in previous months)
    let newVenueCount = 0;
    let newItemCount = 0;
    
    monthVenues.forEach(venue => {
      if (!historicalVenues.has(venue)) {
        newVenueCount++;
        historicalVenues.add(venue);
      }
    });
    
    monthItems.forEach(item => {
      if (!historicalItems.has(item)) {
        newItemCount++;
        historicalItems.add(item);
      }
    });
    
    // Calculate ratios
    const uniqueVenuesRatio = monthOrders.length > 0 ? 
      Math.min(1, monthVenues.size / monthOrders.length) : 0;
    
    // Calculate uniqueItemsRatio as unique items divided by total item entries
    // This measures how diverse the actual items ordered are, rather than items per order
    const uniqueItemsRatio = totalItemEntries > 0 ? 
      Math.min(1, monthItems.size / totalItemEntries) : 0;
    
    // For new order ratio, cap at 1.0 to prevent exceeding 100% 
    const newItemsVenuesTotal = monthVenues.size + monthItems.size;
    const newOrderRatio = (newItemsVenuesTotal > 0) ? 
      Math.min(1, (newVenueCount + newItemCount) / newItemsVenuesTotal) : 0;
    
    // Calculate composite diversity score (weighted average)
    // Weights can be adjusted based on importance
    const venueWeight = 0.4;
    const itemWeight = 0.4;
    const newWeight = 0.2;
    
    // Ensure the score stays within 0-100 range
    let score = (
      uniqueVenuesRatio * venueWeight +
      uniqueItemsRatio * itemWeight +
      newOrderRatio * newWeight
    ) * 100;
    
    // Cap score at 100 for consistency
    score = Math.min(100, score);
    
    return {
      month,
      score: Math.round(score * 10) / 10, // Round to 1 decimal place
      uniqueVenuesRatio,
      uniqueItemsRatio,
      newOrderRatio
    };
  });
}

// Calculate diversity score statistics
export function getDiversityScoreStats(scores: DiversityScore[]) {
  if (scores.length === 0) {
    return { average: 0, highest: 0, lowest: 0, trend: 'stable' };
  }
  
  const average = scores.reduce((sum, score) => sum + score.score, 0) / scores.length;
  const highest = Math.max(...scores.map(s => s.score));
  const lowest = Math.min(...scores.map(s => s.score));
  
  // Calculate trend (are scores increasing, decreasing, or stable?)
  let trend = 'stable';
  if (scores.length >= 3) {
    const recentMonths = scores.slice(-3);
    const firstScore = recentMonths[0].score;
    const lastScore = recentMonths[recentMonths.length - 1].score;
    
    if (lastScore > firstScore * 1.1) { // 10% increase threshold
      trend = 'increasing';
    } else if (lastScore < firstScore * 0.9) { // 10% decrease threshold
      trend = 'decreasing';
    }
  }
  
  return {
    average: Math.round(average * 10) / 10,
    highest: Math.round(highest * 10) / 10, 
    lowest: Math.round(lowest * 10) / 10,
    trend
  };
}