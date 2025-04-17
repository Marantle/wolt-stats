import { useState, useCallback, useRef } from 'react';
import type { WoltOrderFile } from '../../woltorder';

interface WelcomeProps {
  onDataLoaded: (data: WoltOrderFile) => void;
  isSharedView?: boolean;
}

export default function Welcome({ onDataLoaded, isSharedView }: WelcomeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback((file: File) => {
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
    processFile(file);
  }, [processFile]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  }, [processFile]);

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
          <li>Go to <a href="https://wolt.com/en/account/order-history" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Wolt Order History</a></li>
          <li>Click on "Request order history"</li>
          <li>Check your email for the order history file</li>
          <li>Drop the file below or click to upload</li>
        </ol>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInputChange}
          accept="application/json"
          className="hidden"
          data-testid="file-input"
        />

        <div 
          className={`flex flex-col items-center justify-center min-h-[200px] border-4 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
          data-testid="dropzone"
        >
          <p className="font-medium mb-4">Drop your Wolt order data file here or click to upload</p>
          <div className="text-sm text-gray-500 space-y-1">
            <p>✓ File format: JSON</p>
            <p>✓ Contains complete order history</p>
            <p>✓ Filename: wolt_order_dump.json</p>
          </div>
          <div className="mt-4 text-sm space-y-2">
            <p className="text-gray-600">
              🔒 For your privaty, the data stays in your browser
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}