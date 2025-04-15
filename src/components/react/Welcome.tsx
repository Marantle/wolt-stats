import { useState, useCallback } from 'react';
import type { WoltOrderFile } from '../../woltorder';

interface WelcomeProps {
  onDataLoaded: (data: WoltOrderFile) => void;
  isSharedView?: boolean;
}

export default function Welcome({ onDataLoaded, isSharedView }: WelcomeProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string) as WoltOrderFile;
          if (data.orders) {
            onDataLoaded(data);
          } else {
            alert('Invalid file format. Please upload a valid Wolt order export file.');
          }
        } catch (error) {
          alert('Error parsing file. Please make sure it\'s a valid JSON file.');
        }
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a JSON file.');
    }
  }, [onDataLoaded]);

  if (isSharedView) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-700">Viewing Shared Wolt Stats</h2>
        <p className="text-gray-600 mb-6">
          You're viewing someone's shared Wolt order statistics.
        </p>
        <div className="text-sm text-gray-500">
          Want to see your own stats?
          <div 
            className={`mt-4 flex flex-col items-center justify-center min-h-[200px] border-4 border-dashed rounded-lg p-8 transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <p className="font-medium">Drop your Wolt order export file here</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center p-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-700">Welcome to Wolt Stats Dashboard</h2>
      <div className="max-w-2xl mx-auto">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">How to get your order data:</h3>
        <ol className="text-left text-gray-600 mb-6 space-y-2 list-decimal list-inside">
          <li>Visit <a href="https://wolt.com/en/me/order-history" className="text-blue-600 hover:underline" target="_blank" rel="noopener">Wolt Order History</a></li>
          <li>Open your browser's Developer Tools (F12)</li>
          <li>Go to the Network tab</li>
          <li>Refresh the page</li>
          <li>Find the request to <code className="bg-gray-100 px-2 py-1 rounded">order_history</code></li>
          <li>Right-click and select "Copy as cURL"</li>
          <li>Paste in your terminal, modify the URL's limit parameter to 5000</li>
          <li>Pipe the output to <code className="bg-gray-100 px-2 py-1 rounded">wolt_order_dump.json</code></li>
        </ol>

        <div 
          className={`flex flex-col items-center justify-center min-h-[200px] border-4 border-dashed rounded-lg p-8 transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <p className="font-medium mb-4">Drop your Wolt order data file here</p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>✓ File format: JSON</p>
            <p>✓ Contains complete order history</p>
            <p>✓ Filename: wolt_order_dump.json</p>
          </div>
        </div>
      </div>
    </div>
  );
}