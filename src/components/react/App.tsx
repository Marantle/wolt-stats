import React, { useState } from 'react';
import type { WoltOrder, WoltOrderFile } from '../../woltorder';
import { getOrdersByMonth, getTopVenuesByOrderCount, getTopVenuesBySpending, 
  getAverageOrderValueByMonth, getOrdersByDayOfWeek, getOrdersByTimeOfDay, 
  getFavoriteItems, formatCurrency, getSummaryStats } from '../../utils/orderUtils';
import Welcome from './Welcome';
import StatsCard from './StatsCard';
import FavoriteItemsTable from './FavoriteItemsTable';
import MonthlyOrdersChart from './charts/MonthlyOrdersChart';
import MonthlySpendingChart from './charts/MonthlySpendingChart';
import TopVenuesByCountChart from './charts/TopVenuesByCountChart';
import TopVenuesBySpendingChart from './charts/TopVenuesBySpendingChart';
import AvgOrderOverTimeChart from './charts/AvgOrderOverTimeChart';
import OrdersByDayChart from './charts/OrdersByDayChart';
import OrderTimeHistogram from './charts/OrderTimeHistogram';

export default function App() {
  const [orderData, setOrderData] = useState<WoltOrder[] | null>(null);

  const handleDataLoaded = (data: WoltOrderFile) => {
    const orders = data.orders.filter(order => order.status === 'delivered');
    setOrderData(orders);
  };

  if (!orderData) {
    return <Welcome onDataLoaded={handleDataLoaded} />;
  }

  const monthlyOrders = getOrdersByMonth(orderData);
  const topVenuesByCount = getTopVenuesByOrderCount(orderData, 10);
  const topVenuesBySpending = getTopVenuesBySpending(orderData, 10);
  const avgOrderByMonth = getAverageOrderValueByMonth(orderData);
  const ordersByDay = getOrdersByDayOfWeek(orderData);
  const ordersByTime = getOrdersByTimeOfDay(orderData);
  const favoriteItems = getFavoriteItems(orderData, 10);
  const { totalOrders, totalSpent, averageOrderValue, longestStreak } = getSummaryStats(orderData);

  return (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-700">Order Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard 
            title="Total Orders" 
            value={totalOrders} 
            description="All-time number of orders"
            color="blue"
          />
          
          <StatsCard 
            title="Total Spent" 
            value={formatCurrency(totalSpent)}
            description="All-time spending"
            color="green"
          />
          
          <StatsCard 
            title="Average Order Value" 
            value={formatCurrency(averageOrderValue)}
            description="Average amount per order"
            color="purple"
          />
          
          <StatsCard 
            title="Longest Order Streak" 
            value={longestStreak}
            description="Consecutive days with orders"
            color="amber"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <MonthlyOrdersChart monthlyOrders={monthlyOrders} />
        <MonthlySpendingChart monthlyOrders={monthlyOrders} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <TopVenuesByCountChart topVenues={topVenuesByCount} />
        <TopVenuesBySpendingChart topVenues={topVenuesBySpending} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AvgOrderOverTimeChart avgOrderByMonth={avgOrderByMonth} />
        <OrdersByDayChart ordersByDay={ordersByDay} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <OrderTimeHistogram ordersByTime={ordersByTime} />
        <FavoriteItemsTable items={favoriteItems} />
      </div>
    </>
  );
}