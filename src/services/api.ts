import { supabase } from "../lib/supabase";
import { MenuItem, Order, QueueItem, SeatSection } from "../types";

export const api = {
  // Menu
  getMenu: async (): Promise<MenuItem[]> => {
    try {
      const { data, error } = await supabase.from('menu').select('*');
      
      if (error) throw error;
      
      if (!data || data.length === 0) {
        // Fallback to Express if Supabase table is empty for initial run
        const res = await fetch("/api/menu");
        return res.json();
      }
      return data as MenuItem[];
    } catch (error) {
      console.error("Error fetching menu:", error);
      return [];
    }
  },

  // Orders
  placeOrder: async (items: any[], total: number, pickupTime?: string, location?: string, userId?: string): Promise<Order> => {
    const orderData = {
      items,
      total,
      user_id: userId || "unknown", // Using snake_case for Postgres
      pickup_time: pickupTime || "ASAP",
      location: location || "Canteen",
      status: "pending",
      payment_status: "Paid (Munch-Wallet)",
      qr_code: `MUNCH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    };

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();
        
      if (error) throw error;
      return { 
        id: data.id, 
        ...data, 
        timestamp: new Date(data.created_at) 
      } as unknown as Order; // Mapping Postgres keys to our internal type
    } catch (error) {
      console.error("Error placing order:", error);
      throw error;
    }
  },

  // Live Subscriptions
  subscribeToOrders: (callback: (orders: Order[]) => void) => {
    const channel = supabase
      .channel('orders_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        async () => {
          // Fetch latest when a change happens
          const { data } = await supabase
            .from('orders')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (data) {
            const mappedOrders = data.map(d => ({
              id: d.id,
              ...d,
              timestamp: new Date(d.created_at)
            })) as unknown as Order[];
            callback(mappedOrders);
          }
        }
      )
      .subscribe();
      
    // Initial fetch
    supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({data}) => {
      if (data) {
        callback(data.map(d => ({id: d.id, ...d, timestamp: new Date(d.created_at)})) as unknown as Order[]);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToQueue: (callback: (queue: QueueItem[]) => void) => {
    const channel = supabase
      .channel('queue_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders' }, 
        async () => {
          const { data } = await supabase
            .from('orders')
            .select('id, status')
            .neq('status', 'delivered')
            .order('created_at', { ascending: false });
            
          if (data) {
            callback(data.map(d => ({ 
              orderId: d.id, 
              status: d.status.charAt(0).toUpperCase() + d.status.slice(1) 
            })));
          }
        }
      )
      .subscribe();
      
    // Initial fetch
    supabase.from('orders').select('id, status').neq('status', 'delivered').order('created_at', { ascending: false }).then(({data}) => {
      if (data) {
        callback(data.map(d => ({ orderId: d.id, status: d.status.charAt(0).toUpperCase() + d.status.slice(1) })));
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  },

  updateOrderStatus: async (orderId: string, status: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
        
      if (error) throw error;
    } catch (error) {
      console.error("Error updating order:", error);
    }
  },

  getFinancials: async (): Promise<any> => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('id, total, status')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const todayRevenue = orders
        .filter(o => o.status !== "pending")
        .reduce((sum, o) => sum + (o.total || 0), 0);
        
      const pendingPayments = orders
        .filter(o => o.status === "pending")
        .reduce((sum, o) => sum + (o.total || 0), 0);

      const transactions = orders.map(d => ({
        id: `TRX-${d.id}`,
        orderId: d.id,
        amount: d.total,
        status: d.status === "pending" ? "Pending" : "Success",
        method: "Munch-Wallet"
      }));

      return { todayRevenue, pendingPayments, transactions };
    } catch (error) {
      console.error("Error getting financials:", error);
      return { todayRevenue: 0, pendingPayments: 0, transactions: [] };
    }
  },

  getProfile: async (userId: string): Promise<any> => {
    // If you have a profiles table in Supabase, you can fetch from there.
    // Otherwise fallback to Express mock.
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (!error && data) return data;
    } catch {}
    
    const res = await fetch("/api/profile", { headers: { 'x-user-id': userId } });
    return res.json();
  },

  getSeats: async (): Promise<{ sections: SeatSection[]; total: number; available: number }> => {
    const res = await fetch("/api/seats");
    return res.json();
  },

  // Bookings
  bookSeat: async (bookingData: any) => {
    const data = {
      ...bookingData,
      status: "confirmed"
    };
    try {
      const { data: inserted, error } = await supabase
        .from('bookings')
        .insert([data])
        .select()
        .single();
        
      if (error) throw error;
      return inserted;
    } catch (error) {
      console.error("Error booking seat:", error);
      throw error;
    }
  },

  subscribeToBookings: (callback: (bookings: any[]) => void) => {
    const channel = supabase
      .channel('bookings_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bookings' }, 
        async () => {
          const { data } = await supabase
            .from('bookings')
            .select('*')
            .order('created_at', { ascending: false });
          if (data) callback(data);
        }
      )
      .subscribe();
      
    supabase.from('bookings').select('*').order('created_at', { ascending: false }).then(({data}) => {
      if (data) callback(data);
    });

    return () => {
      supabase.removeChannel(channel);
    };
  },

  updateBookingStatus: async (bookingId: string, status: string): Promise<void> => {
    try {
      await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);
    } catch (error) {
      console.error("Error updating booking:", error);
    }
  }
};
