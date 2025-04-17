import type { WoltOrderFile } from '../../woltorder';

export const sampleOrderData: WoltOrderFile = {
  orders: [
    {
      purchase_id: "test123",
      received_at: "15/04/2025, 12:30",
      status: "delivered",
      venue_name: "Test Restaurant",
      total_amount: "€25.90",
      is_active: true,
      payment_time_ts: 1681563000,
      main_image: "https://example.com/image.jpg",
      main_image_blurhash: "L9R:Xm~qRj-;tRWBogay00of?bxu",
      items: "Test Item 1, Test Item 2"
    }
  ]
};