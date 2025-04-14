import React, { useState } from 'react';

interface FavoriteItemsTableProps {
  items: { item: string; count: number }[];
  title?: string;
  maxHeight?: string;
}

const FavoriteItemsTable: React.FC<FavoriteItemsTableProps> = ({
  items,
  title = "Favorite Items",
  maxHeight = "400px"
}) => {
  const [isCensored, setIsCensored] = useState(true);

  const processedItems = items.map((item, index) => ({
    ...item,
    item: isCensored ? `[Item ${index + 1}]` : item.item
  }));

  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>
      <button
        onClick={() => setIsCensored(!isCensored)}
        className="mb-2 px-3 py-1 text-sm rounded bg-blue-500 hover:bg-blue-600 text-white"
      >
        {isCensored ? 'Show Item Names' : 'Hide Item Names'}
      </button>
      <div className="overflow-auto" style={{ maxHeight }}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Count
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processedItems.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.item}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.count}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FavoriteItemsTable;