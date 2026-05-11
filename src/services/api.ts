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

  updateOrderStatus: async (orderId: string, status?: string, paymentStatus?: string): Promise<void> => {
    const path = `orders/${orderId}`;
    try {
      const orderRef = doc(db, "orders", orderId);
      const updates: any = {};
      if (status) updates.status = status;
      if (paymentStatus) updates.paymentStatus = paymentStatus;
      await updateDoc(orderRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  addMenuItem: async (item: Omit<MenuItem, "id">): Promise<void> => {
    const path = "menu";
    try {
      await addDoc(collection(db, path), item);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  updateMenuItem: async (itemId: string, updates: Partial<MenuItem>): Promise<void> => {
    const path = `menu/${itemId}`;
    try {
      const itemRef = doc(db, "menu", itemId);
      await updateDoc(itemRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  deleteMenuItem: async (itemId: string): Promise<void> => {
    const path = `menu/${itemId}`;
    try {
      const { deleteDoc } = await import("firebase/firestore");
      await deleteDoc(doc(db, "menu", itemId));
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
    const path = `users/${userId}`;
    try {
      const docRef = doc(db, "users", userId);
      const snapshot = await getDocs(query(collection(db, "users"))); // Just checking if exists might be better
      // But let's use getDoc (Wait, I need to import getDoc)
      // Actually let's just stick to the pattern used in the app
      const res = await fetch("/api/profile", { headers: { 'x-user-id': userId } });
      return res.json();
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  ensureProfile: async (user: any): Promise<void> => {
    const path = `users/${user.uid}`;
    try {
      const { setDoc, getDoc } = await import("firebase/firestore");
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        const isAdmin = user.email?.includes("admin") || user.email === "saatwikpagi5@gmail.com";
        await setDoc(userRef, {
          uid: user.uid,
          email: user.email || "",
          walletBalance: 2500, // Starting balance for students
          points: 100,
          streak: 1,
          isAdmin: isAdmin,
          gstNumber: isAdmin ? "22AAAAA0000A1Z5" : null,
          merchantCode: isAdmin ? `MERCH-${user.uid.slice(0, 6).toUpperCase()}` : null
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  getSeats: async (): Promise<{ sections: SeatSection[]; total: number; available: number }> => {
    const res = await fetch("/api/seats");
    return res.json();
  },

  // Bookings
  bookSeat: async (bookingData: any) => {
    const path = "bookings";
    const data = {
      ...bookingData,
      status: "confirmed",
      createdAt: Timestamp.now()
    };
    try {
      const docRef = await addDoc(collection(db, path), data);
      return { id: docRef.id, ...data };
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  },

  subscribeToBookings: (callback: (bookings: any[]) => void) => {
    const path = "bookings";
    const q = query(collection(db, path), orderBy("createdAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      const bookings = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate()
      }));
      callback(bookings);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
  },

  updateBookingStatus: async (bookingId: string, status: string): Promise<void> => {
    const path = `bookings/${bookingId}`;
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, { status });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  }
};
