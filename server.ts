import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory data structures for Demo purposes
  // In a real app, these would be in Firestore/Postgres
  const menu = [
    { 
      id: "1", 
      name: "Classic Goan Fish Thali", 
      price: 180, 
      category: "Main Course", 
      description: "Authentic Goan thali with fish curry, rice, and fried fish.", 
      image: "https://images.unsplash.com/photo-1589187151053-5ec8818e661b?w=500&q=80",
      macros: { protein: "25g", carbs: "60g", calories: 450 }
    },
    { 
      id: "2", 
      name: "Veg Xacuti", 
      price: 120, 
      category: "Curry", 
      description: "Traditional Goan vegetable curry with roasted coconut and spices.", 
      image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&q=80",
      macros: { protein: "10g", carbs: "40g", calories: 320 }
    },
    { 
      id: "3", 
      name: "Chicken Cafreal", 
      price: 220, 
      category: "Starters", 
      description: "Green spicy chicken preparation, a Goan favorite.", 
      image: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=500&q=80",
      macros: { protein: "35g", carbs: "5g", calories: 280 }
    },
    { 
      id: "4", 
      name: "Samosa Pav", 
      price: 30, 
      category: "Snacks", 
      description: "Crispy samosa served in a fresh Goan pav.", 
      image: "https://images.unsplash.com/photo-1601050690597-df056fb04791?w=500&q=80",
      macros: { protein: "4g", carbs: "30g", calories: 150 }
    },
    { 
      id: "5", 
      name: "Exam Mode: Brain Booster", 
      price: 150, 
      category: "Special", 
      description: "Nuts, Green Tea, and Fruit platter designed for long study sessions.", 
      image: "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?w=500&q=80",
      macros: { protein: "12g", carbs: "20g", calories: 180 },
      isExamMode: true
    },
     { 
      id: "6", 
      name: "Library Nitro Coffee", 
      price: 90, 
      category: "Drinks", 
      description: "Double shot espresso to keep you awake during finals.", 
      image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80",
      macros: { protein: "2g", carbs: "2g", calories: 45 }
    },
  ];

  let orders = [];
  let seatBookings = [];
  let queue = [];
  let userProfiles = {
    "test-user": { uid: "test-user", walletBalance: 1500, points: 240, streak: 4 }
  };

  // API Routes
  app.get("/api/menu", (req, res) => {
    res.json(menu);
  });

  app.get("/api/profile", (req, res) => {
    const userId = req.headers['x-user-id'] as string || "test-user";
    res.json(userProfiles[userId] || userProfiles["test-user"]);
  });

  app.post("/api/orders", (req, res) => {
    const order = {
      id: `MUNCH-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      items: req.body.items,
      total: req.body.total,
      pickupTime: req.body.pickupTime || "ASAP",
      status: "pending",
      timestamp: new Date(),
      qrCode: `QR_DATA_${Date.now()}`
    };
    orders.push(order);
    queue.push({ orderId: order.id, status: "Preparing" });
    res.status(201).json(order);
  });

  app.get("/api/queue", (req, res) => {
    res.json(queue);
  });

  // Admin Routes
  app.get("/api/admin/orders", (req, res) => {
    res.json(orders);
  });

  app.patch("/api/admin/orders/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    
    orders = orders.map(o => o.id === id ? { ...o, status } : o);
    
    // Update queue status for real-time tracker
    const queueIdx = queue.findIndex(q => q.orderId === id);
    if (queueIdx > -1) {
      if (status === "delivered") {
        queue = queue.filter(q => q.orderId !== id);
      } else {
        queue[queueIdx].status = status.charAt(0).toUpperCase() + status.slice(1);
      }
    }
    
    res.json({ success: true });
  });

  app.get("/api/admin/financials", (req, res) => {
    const todayRevenue = orders
      .filter(o => o.status !== "pending")
      .reduce((sum, o) => sum + o.total, 0);
      
    const pendingPayments = orders
      .filter(o => o.status === "pending")
      .reduce((sum, o) => sum + o.total, 0);

    const transactions = orders.map(o => ({
      id: `TRX-${o.id}`,
      orderId: o.id,
      amount: o.total,
      status: o.status === "pending" ? "Pending" : "Success",
      method: "Munch-Wallet"
    })).reverse();

    res.json({
      todayRevenue,
      pendingPayments,
      transactions
    });
  });

  app.get("/api/seats", (req, res) => {
    // Generate some random seat availability if not present
    res.json({
      available: 45,
      total: 100,
      sections: [
        { id: "indoor", name: "Indoor AC", available: 20 },
        { id: "balcony", name: "Balcony View", available: 15 },
        { id: "garden", name: "Garden Side", available: 10 },
      ]
    });
  });

  app.post("/api/book-seat", (req, res) => {
    const booking = {
      id: `BOOK-${Date.now()}`,
      userId: req.body.userId,
      sectionId: req.body.sectionId,
      time: req.body.time,
      guests: req.body.guests,
      timestamp: new Date(),
    };
    seatBookings.push(booking);
    res.status(201).json(booking);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CampusCrave Server running on http://localhost:${PORT}`);
  });
}

startServer();
