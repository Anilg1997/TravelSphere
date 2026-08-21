export interface Restaurant {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  address: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  phoneNumber: string;
  imageUrl: string;
  avgDeliveryTimeMinutes: number;
  rating: number;
  reviewCount: number;
  minOrderAmount: number;
  deliveryFee: number;
  tags: string[];
  menuItems?: MenuItem[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  category: string;
  price: number;
  imageUrl: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  spiceLevel: string;
  prepTimeMinutes: number;
}

export interface FoodOrderRequest {
  restaurantId: string;
  deliveryAddress: string;
  deliveryLatitude?: number;
  deliveryLongitude?: number;
  items: OrderItemRequest[];
  specialInstructions?: string;
  paymentMethod?: string;
}

export interface OrderItemRequest {
  menuItemId: string;
  itemName: string;
  quantity: number;
  specialInstructions?: string;
}

export interface FoodOrderResponse {
  orderRef: string;
  restaurantId: string;
  restaurantName: string;
  deliveryAddress: string;
  items: OrderItemResponse[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  totalAmount: number;
  status: string;
  specialInstructions?: string;
  estimatedDeliveryTime: string;
  orderedAt: string;
  deliveredAt?: string;
  paymentMethod?: string;
}

export interface OrderItemResponse {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  specialInstructions?: string;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}
