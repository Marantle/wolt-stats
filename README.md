# Wolt Stats Dashboard

A modern, interactive dashboard for visualizing your Wolt order history with privacy-focused sharing capabilities.

## Features

- 📊 Comprehensive order analytics:
  - Monthly order counts and spending trends
  - Top venues by order count and total spending
  - Average order value over time
  - Order patterns by day of week and time of day
  - Favorite items analysis
  - Key statistics including total orders, spending, and ordering streaks

- 🔒 Privacy-focused sharing:
  - Share your stats while keeping venue names and items private
  - Compressed URL-based sharing
  - Toggle visibility of sensitive information

- 🎨 Modern UI/UX:
  - Responsive design with Tailwind CSS
  - Interactive charts using Chart.js
  - Clean, intuitive layout
  - Drag-and-drop file upload

## Getting Started

### Getting Your Order Data

To get your order history:

1. Visit [Wolt Order History](https://wolt.com/en/me/order-history)
2. Open your browser's Developer Tools (F12)
3. Go to the Network tab
4. Refresh the page
5. Find the request to `order_history`
6. Right-click and "Copy as cURL"
7. Paste in your terminal, modify the URL to increase the limit parameter, and pipe to a JSON file:
   ```
   # Replace the limit parameter in the URL:
   # https://consumer-api.wolt.com/order-tracking-api/v1/order_history/?limit=5000
   
   # Then pipe the curl output to wolt_order_dump.json:
   curl 'https://consumer-api.wolt.com/order-tracking-api/v1/order_history/?limit=5000' \
     -H 'x-wolt-web-clientid: some clientid' \
     -H 'w-wolt-session-id: some session id' \
     -H 'authorization: Bearer YOUR_TOKEN_HERE' \
     ... [other headers from browser] ... \
     > wolt_order_dump.json
   ```

### Using the Dashboard

1. Visit the dashboard
2. Drag and drop your exported JSON file
3. Explore your order statistics!

### Sample Data Format

Your JSON file should look like this:

```json
{
  "orders": [
    {
      "purchase_id": "abc123xyz",
      "received_at": "15/04/2025, 12:30",
      "status": "delivered",
      "venue_name": "Sample Restaurant",
      "total_amount": "€25.90",
      "is_active": true,
      "payment_time_ts": 1681563000,
      "main_image": "https://example.com/image.jpg",
      "main_image_blurhash": "L9R:Xm~qRj-;tRWBogay00of?bxu",
      "items": "Burger, Fries, Soda"
    }
  ]
}
```

Save this as `wolt_order_dump.json` to try out the dashboard with sample data.

## Tech Stack

- [Astro](https://astro.build/) - Web framework
- [React](https://reactjs.org/) - UI components
- [Chart.js](https://www.chartjs.org/) - Data visualization
- [TailwindCSS](https://tailwindcss.com/) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Privacy

Your data never leaves your browser. The sharing feature uses URL-based compression and allows you to hide sensitive information like venue names and specific items ordered.

## License

MIT
