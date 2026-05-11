import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc,
  Timestamp 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { MenuItem, Order, QueueItem, SeatSection } from "../types";
import { handleFirestoreError, OperationType } from "../lib/firestore-errors";

export const api = {
  // Menu
  getMenu: async (): Promise<MenuItem[]> => {
    const path = "menu";
    try {
      const querySnapshot = await getDocs(collection(db, path));
      if (querySnapshot.empty) {
        // Fallback to Express if Firestore is empty for initial run
        const res = await fetch("/api/menu");
        return res.json();
      }
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem));
    } catch (error) {
      if (error instanceof Error && error.message.includes('"error":')) {
        throw error;
      }
      handleFirestoreError(error, OperationType.GET, path);
      // This line is unreachable but keeps TS happy
      return [];
    }
  },

  // Orders
  placeOrder: async (items: any[], total: number, pickupTime?: string, location?: string, userId?: string): Promise<Order> => {
    const path = "orders";
    const orderData = {
      items,
      total,
      userId: userId || "unknown",
      pickupTime: pickupTime || "ASAP",
      location: location || "Canteen",
      status: "pending",
      paymentStatus: "Paid (Munch-Wallet)",
      createdAt: Timestamp.now(),
      qrCode: `MUNCH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };

    try {
      const docRef = await addDoc(collection(db, path), orderData);
      return { id: docRef.id, ...orderData, timestamp: orderData.createdAt.toDate() } as Order;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  },

  // Live Subscriptions
  subscribeToOrders: (callback: (orders: Order[]) => void) => {
    const path = "orders";
    const q = query(collection(db, path), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        timestamp: (doc.data().createdAt as Timestamp).toDate()
      } as Order));
      callback(orders);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  subscribeToQueue: (callback: (queue: QueueItem[]) => void) => {
    const path = "orders";
    const q = query(collection(db, path), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs
        .filter(doc => doc.data().status !== "delivered")
        .map(doc => ({ 
          orderId: doc.id, 
          status: doc.data().status.charAt(0).toUpperCase() + doc.data().status.slice(1)
        } as QueueItem));
      callback(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<void> => {
    const path = `orders/${orderId}`;
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  getFinancials: async (): Promise<any> => {
    const path = "orders";
    try {
      const snapshot = await getDocs(collection(db, path));
      const orders = snapshot.docs.map(doc => doc.data());
      
      const todayRevenue = orders
        .filter(o => o.status !== "pending")
        .reduce((sum, o) => sum + (o.total || 0), 0);
        
      const pendingPayments = orders
        .filter(o => o.status === "pending")
        .reduce((sum, o) => sum + (o.total || 0), 0);

      const transactions = snapshot.docs.map(d => ({
        id: `TRX-${d.id}`,
        orderId: d.id,
        amount: d.data().total,
        status: d.data().status === "pending" ? "Pending" : "Success",
        method: "Munch-Wallet"
      })).reverse();

      return {
        todayRevenue,
        pendingPayments,
        transactions
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  getProfile: async (userId: string): Promise<any> => {
    const res = await fetch("/api/profile", { headers: { 'x-user-id': userId } });
    return res.json();
  },

  getSeats: async (): Promise<{ sections: SeatSection[]; total: number; available: number }> => {
    const res = await fetch("/api/seats");
    return res.json();
  },

  bookSeat: async (bookingData: any) => {
    const res = await fetch("/api/book-seat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bookingData),
    });
    return res.json();
  }
};
