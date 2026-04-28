export interface Shop {
  name: string;
  details: string;
}

export interface Item {
  id: number;
  name: string;
  price: number;
  stock: number;
  photo: string;
  description: string;
}

export interface Customer {
  nickname: string;
  contact: string;
}

export interface CartItem extends Item {
  quantity: number;
}

export type OrderStatus = 'pending' | 'awaiting_payment' | 'paid_awaiting_approval' | 'completed';

export interface Order {
  id: string;
  customer: Customer;
  items: CartItem[];
  total: number;
  receiveMethod: string; // 'delivery' | 'pickup'
  paymentOption: string; // 'now' | 'later'
  lat?: number;
  lng?: number;
  locationDetail?: string;
  slipPath?: string;
  status: OrderStatus;
  timestamp: string;
}

export interface Message {
  id: number;
  orderId: string;
  sender: 'customer' | 'admin';
  text: string;
  timestamp: string;
}

export interface PromotionConfig {
  id: number;
  weight: number;
}

export interface POSContextType {
  shop: Shop;
  updateShop: (newShop: Shop) => Promise<void>;
  items: Item[];
  addItem: (item: Omit<Item, 'id'>) => Promise<void>;
  updateItem: (id: number, item: Omit<Item, 'id'>) => Promise<void>;
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'status' | 'timestamp'>) => Promise<string>;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;
  messages: Message[];
  addMessage: (orderId: string, sender: 'customer' | 'admin', text: string) => Promise<void>;
  fetchMessagesForOrder: (orderId: string) => Promise<void>;
  updateOrderFreeItem: (orderId: string, newItemId: number) => Promise<void>;
  language: 'en' | 'th';
  setLanguage: (lang: 'en' | 'th') => void;
  promotionItems: PromotionConfig[];
  updatePromotionItems: (items: PromotionConfig[]) => Promise<void>;
  orderMetadata: Record<string, { received: boolean; receivedAt?: string }>;
  toggleOrderReceived: (orderId: string, received: boolean) => Promise<void>;
  t: (key: string) => string;
}


