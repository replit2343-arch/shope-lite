import express, { type Request, type Response, Router } from "express";
import cors from "cors";
import { db, initPostgresTables } from "../db/index";

export const apiRouter = Router();

apiRouter.use(cors());
apiRouter.use(express.json());

// Initialize database tables on first API access
initPostgresTables().catch((err) => {
  console.warn("initPostgresTables notice:", err);
});

// Health & System Info
apiRouter.get("/health", async (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    app: "Kingz Sparepart Computer",
    backend: "Express.js",
    database: db.isPgConnected()
      ? "PostgreSQL (Connected)"
      : "PostgreSQL (Fallback / Memory Ready)",
    port: process.env.PORT || 3008,
    timestamp: new Date().toISOString(),
  });
});

// Auth Routes
apiRouter.post("/auth/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email dan kata sandi wajib diisi" });
    }

    const adminEmail = process.env.ADMIN_EMAIL || "admin@kingz.id";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";

    // Check against configured admin credentials from .env first
    if (email.toLowerCase() === adminEmail.toLowerCase() && password === adminPassword) {
      return res.json({
        token: `jwt-admin-${Date.now()}`,
        user: {
          id: 1,
          name: process.env.ADMIN_NAME || "Admin Kingz",
          email: adminEmail,
          phone: "081200000001",
          role: "admin",
          active: true,
        },
      });
    }

    // Otherwise check database users
    const user = await db.authenticate(email, password);
    if (!user) {
      return res.status(401).json({ error: "Email atau kata sandi salah" });
    }

    if (!user.active) {
      return res.status(403).json({ error: "Akun ini sedang dinonaktifkan" });
    }

    return res.json({
      token: `jwt-token-${user.id}-${Date.now()}`,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        active: user.active,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Terjadi kesalahan pada server saat login" });
  }
});

apiRouter.post("/auth/register", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Data registrasi tidak lengkap" });
    }

    const newUser = await db.createUser({
      name,
      email,
      phone: phone || "",
      role: "pembeli",
      active: true,
      password,
    });

    res.status(201).json({
      token: `jwt-token-${newUser.id}-${Date.now()}`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        active: newUser.active,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Gagal membuat akun" });
  }
});

// Products Routes
apiRouter.get("/products", async (_req: Request, res: Response) => {
  try {
    const products = await db.getProducts();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil daftar produk" });
  }
});

apiRouter.post("/products", async (req: Request, res: Response) => {
  try {
    const { name, price, stock, images, specs } = req.body;
    if (!name || price === undefined) {
      return res.status(400).json({ error: "Nama dan harga produk wajib diisi" });
    }

    const created = await db.createProduct({
      name,
      price: Number(price),
      stock: Number(stock) || 0,
      images: Array.isArray(images) ? images : [],
      specs: specs || {
        category: "",
        brand: "",
        warrantyPeriod: "",
        warrantyType: "",
        custom: "Tidak",
        certificate: "-",
        origin: "-",
        shipFrom: "KOTA JAKARTA PUSAT",
        description: "",
      },
    });

    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Gagal menyimpan produk baru" });
  }
});

apiRouter.put("/products/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = await db.updateProduct(id, req.body);
    if (!updated) return res.status(404).json({ error: "Produk tidak ditemukan" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Gagal memperbarui produk" });
  }
});

apiRouter.delete("/products/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await db.deleteProduct(id);
    res.json({ success: true, message: "Produk berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: "Gagal menghapus produk" });
  }
});

// Users Routes
apiRouter.get("/users", async (_req: Request, res: Response) => {
  try {
    const users = await db.getUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data user" });
  }
});

apiRouter.post("/users", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, role, active, password } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: "Nama dan email wajib diisi" });
    }
    const created = await db.createUser({
      name,
      email,
      phone: phone || "",
      role: role || "pembeli",
      active: active !== undefined ? Boolean(active) : true,
      password: password || "password123",
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Gagal menambah user" });
  }
});

apiRouter.put("/users/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = await db.updateUser(id, req.body);
    if (!updated) return res.status(404).json({ error: "User tidak ditemukan" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Gagal memperbarui user" });
  }
});

apiRouter.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await db.deleteUser(id);
    res.json({ success: true, message: "User berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: "Gagal menghapus user" });
  }
});

// Shop Profile Routes
apiRouter.get("/shop", async (_req: Request, res: Response) => {
  try {
    const shop = await db.getShop();
    res.json(shop);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil profil toko" });
  }
});

apiRouter.put("/shop", async (req: Request, res: Response) => {
  try {
    const updated = await db.updateShop(req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Gagal memperbarui profil toko" });
  }
});

// Chat Routes
apiRouter.get("/chat", async (_req: Request, res: Response) => {
  try {
    const messages = await db.getChatMessages();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil riwayat chat" });
  }
});

apiRouter.post("/chat", async (req: Request, res: Response) => {
  try {
    const { sender, text } = req.body;
    if (!text) return res.status(400).json({ error: "Pesan tidak boleh kosong" });
    const msg = await db.addChatMessage(sender || "me", text);

    // Auto seller reply simulation if message is from customer
    if (sender === "me") {
      setTimeout(async () => {
        let reply =
          "Terima kasih telah menghubungi Kingz Sparepart! Admin kami sedang mengecek detail pesanan/pertanyaan Anda.";
        const lower = text.toLowerCase();
        if (lower.includes("ready") || lower.includes("stok")) {
          reply = "Barang ready stock kak, siap dikirim hari ini sebelum jam 17.00 WIB!";
        } else if (lower.includes("garansi")) {
          reply =
            "Semua adaptor bergaransi resmi toko 3 - 6 bulan tukar baru kak, garansi aman terjamin!";
        } else if (lower.includes("asus")) {
          reply =
            "Untuk Asus silakan cek diameter colokan (4.5mm atau 5.5mm) dan voltasenya ya kak.";
        }
        await db.addChatMessage("seller", reply);
      }, 1000);
    }

    res.status(201).json(msg);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengirim chat" });
  }
});

// Testimonials Routes
apiRouter.get("/testimonials", async (_req: Request, res: Response) => {
  try {
    const list = await db.getTestimonials();
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil testimoni" });
  }
});

apiRouter.post("/testimonials", async (req: Request, res: Response) => {
  try {
    const { name, rating, comment, avatar, media } = req.body;
    const date =
      new Date().toISOString().slice(0, 10) +
      " " +
      new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const created = await db.addTestimonial({
      name: name || "Pengguna Anonim",
      rating: Number(rating) || 5,
      comment: comment || "",
      date,
      avatar: avatar || "",
      media: media || "",
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Gagal menambah testimoni" });
  }
});

apiRouter.delete("/testimonials/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await db.deleteTestimonial(id);
    res.json({ success: true, message: "Testimoni berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: "Gagal menghapus testimoni" });
  }
});

// Orders Routes
apiRouter.get("/orders", async (_req: Request, res: Response) => {
  try {
    const orders = await db.getOrders();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil daftar pesanan" });
  }
});

apiRouter.post("/orders", async (req: Request, res: Response) => {
  try {
    const { buyer_name, buyer_email, buyer_phone, address, items, total_price, payment_method } =
      req.body;
    const order = await db.createOrder({
      buyer_name: buyer_name || "Pembeli",
      buyer_email: buyer_email || "",
      buyer_phone: buyer_phone || "",
      address: address || "",
      items: items || [],
      total_price: Number(total_price) || 0,
      status: "Diproses",
      payment_method: payment_method || "Transfer Bank",
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: "Gagal membuat pesanan" });
  }
});

// Payment Methods Routes
apiRouter.get("/payments", async (_req: Request, res: Response) => {
  try {
    const methods = await db.getPaymentMethods();
    res.json(methods);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil daftar metode pembayaran" });
  }
});

apiRouter.post("/payments", async (req: Request, res: Response) => {
  try {
    const { kind, name, display_type, account, holder, qris_image, instructions, active } =
      req.body;
    if (!name) {
      return res.status(400).json({ error: "Nama metode pembayaran wajib diisi" });
    }
    const created = await db.createPaymentMethod({
      kind: kind || "bank",
      name,
      display_type: display_type || "account",
      account: account || "",
      holder: holder || "",
      qris_image: qris_image || "",
      instructions: instructions || "",
      active: active !== undefined ? Boolean(active) : true,
    });
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: "Gagal menambahkan metode pembayaran" });
  }
});

apiRouter.put("/payments/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const updated = await db.updatePaymentMethod(id, req.body);
    if (!updated) return res.status(404).json({ error: "Metode pembayaran tidak ditemukan" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Gagal memperbarui metode pembayaran" });
  }
});

apiRouter.delete("/payments/:id", async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await db.deletePaymentMethod(id);
    res.json({ success: true, message: "Metode pembayaran berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: "Gagal menghapus metode pembayaran" });
  }
});

export const expressApp = express();
expressApp.use(cors());
expressApp.use(express.json());
expressApp.use("/api", apiRouter);
