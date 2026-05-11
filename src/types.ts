export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
  macros?: {
    protein: string;
    carbs: string;
    calories: number;
  };
  isExamMode?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: "pending" | "preparing" | "ready" | "delivered";
  timestamp: Date;
  pickupTime?: string;
  qrCode?: string;
}

export interface SeatSection {
  id: string;
  name: string;
  available: number;
}

export interface QueueItem {
  orderId: string;
  status: string;
}

export interface UserProfile {
  uid: string;
  walletBalance: number;
  points: number;
  streak: number;
}
