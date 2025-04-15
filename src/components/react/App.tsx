import React, { useState, useEffect } from 'react';
import type { WoltOrder, WoltOrderFile } from '../../woltorder';
import { getOrdersByMonth, getTopVenuesByOrderCount, getTopVenuesBySpending, 
  getAverageOrderValueByMonth, getOrdersByDayOfWeek, getOrdersByTimeOfDay, 
  getFavoriteItems, formatCurrency, getSummaryStats } from '../../utils/orderUtils';
import { generateStatsForSharing, compressStats, decompressStats, type SharedData } from '../../utils/shareUtils';
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

interface PrivacySettings {
  hideVenues: boolean;
  hideItems: boolean;
}

export default function App() {
  const [orderData, setOrderData] = useState<WoltOrder[] | null>(null);
  const [sharedData, setSharedData] = useState<SharedData | null>(null);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    hideVenues: true,
    hideItems: true
  });

  useEffect(() => {
    // Check URL for shared stats
    const urlParams = new URLSearchParams(window.location.search);
    const stats = urlParams.get('stats');
    if (stats) {
      const decompressed = decompressStats(stats);
      if (decompressed) {
        setSharedData(decompressed);
        setPrivacySettings(decompressed.privacySettings);
      }
    }
  }, []);

  const handleDataLoaded = (data: WoltOrderFile) => {
    const orders = data.orders.filter(order => order.status === 'delivered');
    setOrderData(orders);
  };

  const handleShare = () => {
    if (!orderData) return;
    
    const stats = generateStatsForSharing(orderData);
    const compressed = compressStats(stats, privacySettings);
    const url = new URL(window.location.href);
    url.searchParams.set('stats', compressed);
    
    // Copy to clipboard
    navigator.clipboard.writeText(url.toString())
      .then(() => alert('Share link copied to clipboard!'))
      .catch(() => alert('Failed to copy share link'));
  };

  const handleReset = () => {
    setOrderData(null);
    setSharedData(null);
    // Clear URL parameters
    const url = new URL(window.location.href);
    url.search = '';
    window.history.pushState({}, '', url);
  };

  const toggleHideVenues = () => {
    setPrivacySettings(prev => ({ ...prev, hideVenues: !prev.hideVenues }));
  };

  const toggleHideItems = () => {
    setPrivacySettings(prev => ({ ...prev, hideItems: !prev.hideItems }));
  };

  if (!orderData && !sharedData) {
    return <Welcome onDataLoaded={handleDataLoaded} />;
  }

  const stats = sharedData?.stats || (orderData ? generateStatsForSharing(orderData) : null);
  if (!stats) return null;

  const {
    monthlyOrders,
    topVenuesByCount,
    topVenuesBySpending,
    avgOrderByMonth,
    ordersByDay,
    ordersByTime,
    favoriteItems,
    summary: { totalOrders, totalSpent, averageOrderValue, longestStreak }
  } = stats;

  return (
    <>
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-700">Order Overview</h2>
          <div className="flex gap-4">
            {orderData && (
              <>
                <div className="flex gap-2">
                  <button
                    onClick={toggleHideVenues}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                  >
                    {privacySettings.hideVenues ? 'Show Venues' : 'Hide Venues'}
                  </button>
                  <button
                    onClick={toggleHideItems}
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
                  >
                    {privacySettings.hideItems ? 'Show Items' : 'Hide Items'}
                  </button>
                </div>
                <button
                  onClick={handleShare}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Share Stats
                </button>
              </>
            )}
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Reset Data
            </button>
          </div>
        </div>
        
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
        <TopVenuesByCountChart topVenues={topVenuesByCount} isCensored={privacySettings.hideVenues} />
        <TopVenuesBySpendingChart topVenues={topVenuesBySpending} isCensored={privacySettings.hideVenues} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <AvgOrderOverTimeChart avgOrderByMonth={avgOrderByMonth} />
        <OrdersByDayChart ordersByDay={ordersByDay} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <OrderTimeHistogram ordersByTime={ordersByTime} />
        <FavoriteItemsTable items={favoriteItems} isCensored={privacySettings.hideItems} />
      </div>
    </>
  );
}