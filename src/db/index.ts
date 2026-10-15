import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export interface UserRow {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: "admin" | "pembeli";
  active: boolean;
  password?: string;
  created_at?: string;
}

export interface ProductRow {
  id: number;
  name: string;
  price: number;
  stock: number;
  images: string[];
  specs: {
    category: string;
    brand: string;
    warrantyPeriod: string;
    warrantyType: string;
    custom: string;
    certificate: string;
    origin: string;
    shipFrom: string;
    description: string;
  };
}

export interface ShopRow {
  id?: number;
  name: string;
  badge: string;
  activeText: string;
  photo: string;
  tagline: string;
  rating: string;
  chatRate: string;
  joined: string;
  products: string;
  chatTime: string;
  followers: string;
}

export interface ChatMessageRow {
  id: number;
  sender: "seller" | "me";
  text: string;
  time: string;
  created_at?: string;
}

export interface TestimonialRow {
  id: number;
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
  media: string;
}

export interface OrderRow {
  id: number;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  address: string;
  items: unknown[];
  total_price: number;
  status: string;
  payment_method: string;
  created_at?: string;
}

export type PaymentKind = "bank" | "ewallet" | "qris" | "cod";
export type PaymentDisplayType = "account" | "qris";

export interface PaymentMethodRow {
  id: number;
  kind: PaymentKind;
  name: string;
  display_type: PaymentDisplayType;
  account: string;
  holder: string;
  qris_image?: string;
  instructions?: string;
  active: boolean;
}

// In-Memory fallback store if PostgreSQL is unreachable
class MemoryStore {
  adminEmail = process.env.ADMIN_EMAIL || "admin@kingz.id";
  adminPassword = process.env.ADMIN_PASSWORD || "admin123456";

  users: UserRow[] = [
    {
      id: 1,
      name: process.env.ADMIN_NAME || "Admin Kingz",
      email: process.env.ADMIN_EMAIL || "admin@kingz.id",
      phone: "081200000001",
      role: "admin",
      active: true,
      password: process.env.ADMIN_PASSWORD || "admin123456",
    },
    {
      id: 2,
      name: "Budi Santoso",
      email: "budi@mail.com",
      phone: "081234567890",
      role: "pembeli",
      active: true,
      password: "password123",
    },
    {
      id: 3,
      name: "Siti Aminah",
      email: "siti@mail.com",
      phone: "085711112222",
      role: "pembeli",
      active: false,
      password: "password123",
    },
  ];

  shop: ShopRow = {
    name: "Kingz Sparepart Computer",
    badge: "Star+",
    activeText: "Aktif 2 Jam Lalu",
    photo: "/src/assets/store-avatar.jpg",
    tagline: "Sparepart komputer & adaptor laptop original bergaransi",
    rating: "466",
    chatRate: "96%",
    joined: "6 tahun lalu",
    products: "180",
    chatTime: "hitungan jam",
    followers: "120",
  };

  products: ProductRow[] = [
    {
      id: 1,
      name: "Adaptor Laptop Asus 19V 4.74A 90W Original 4.5*3.0mm Pin Central",
      price: 59,
      stock: 25,
      images: [
        "/src/assets/product-main.jpg",
        "/src/assets/product-detail-1.jpg",
        "/src/assets/product-detail-2.jpg",
        "/src/assets/product-detail-3.jpg",
        "/src/assets/product-detail-4.jpg",
      ],
      specs: {
        category:
          "Shopee > Komputer & Aksesoris > Aksesoris Desktop & Laptop > Charger & Adaptor Laptop",
        brand: "Asus",
        warrantyPeriod: "6 Bulan",
        warrantyType: "Garansi Supplier",
        custom: "Tidak",
        certificate: "-",
        origin: "-",
        shipFrom: "KOTA JAKARTA PUSAT",
        description: `NOTE : BARANG YANG DIKIRIM SESUAI GAMBAR\n\nAdaptor Laptop Asus 19V 4.74A 90W Original 4.5*3.0mm Pin Central\n\nModel : A19-090P2A\nINPUT : AC 100-240 50-60HZ 1.5A\nOutput Voltage : 19V 4.74A 90W\nKonektor : 4.5*3.0mm\n\nKondisi : Baru/New\nKualitas : Original\nGaransi : 3 Bulan\n\nCompatible untuk all type Laptop Asus dengan spek adaptor yang sama.`,
      },
    },
  ];

  chatMessages: ChatMessageRow[] = [
    {
      id: 1,
      sender: "seller",
      text: "Halo kak! Selamat datang di Kingz Sparepart Computer. Ada yang bisa kami bantu seputar adaptor laptop?",
      time: "10:00",
    },
    {
      id: 2,
      sender: "me",
      text: "Halo, apakah adaptor Asus 19V 4.74A ready stock kak?",
      time: "10:05",
    },
    {
      id: 3,
      sender: "seller",
      text: "Ready banyak kak, langsung kirim hari ini ya! Silakan diorder.",
      time: "10:06",
    },
  ];

  testimonials: TestimonialRow[] = [
    {
      id: 1,
      name: "r*****4",
      rating: 5,
      comment:
        "Barang ori, charger berfungsi normal buat laptop Asus Vivobook saya. Seller ramah dan respon cepat!",
      date: "2025-10-10 14:22",
      avatar: "/src/assets/review-avatar-1.jpg",
      media: "/src/assets/review-media.jpg",
    },
    {
      id: 2,
      name: "m*****y",
      rating: 5,
      comment: "Pengiriman cepat banget, packing aman berlapis bubble wrap tebal. Mantap!",
      date: "2025-10-12 09:15",
      avatar: "/src/assets/review-avatar-2.jpg",
      media: "",
    },
  ];

  orders: OrderRow[] = [
    {
      id: 1001,
      buyer_name: "Budi Santoso",
      buyer_email: "budi@mail.com",
      buyer_phone: "081234567890",
      address: "Jl. Sudirman No. 45, Jakarta Pusat",
      items: [{ productId: 1, name: "Adaptor Laptop Asus 19V 4.74A 90W", quantity: 1, price: 59 }],
      total_price: 65,
      status: "Diproses",
      payment_method: "DuitNow QR / QRIS",
    },
  ];

  paymentMethods: PaymentMethodRow[] = [
    {
      id: 1,
      kind: "bank",
      name: "Maybank / CIMB Bank Transfer",
      display_type: "account",
      account: "512345678901",
      holder: "Kingz Sparepart Computer",
      instructions: "Transfer sesuai jumlah total pesanan (RM) ke akaun Maybank/CIMB di atas.",
      active: true,
    },
    {
      id: 2,
      kind: "bank",
      name: "BCA / Mandiri Virtual Account",
      display_type: "account",
      account: "1234567890",
      holder: "Kingz Sparepart Computer",
      instructions: "Pilihan transfer bank alternatif via BCA/Mandiri.",
      active: true,
    },
    {
      id: 3,
      kind: "qris",
      name: "DuitNow QR & QRIS All Payment",
      display_type: "qris",
      account: "-",
      holder: "Kingz Sparepart Computer",
      qris_image: "",
      instructions:
        "Scan barcode QR dengan Touch 'n Go, MAE Maybank, CIMB OCTO, atau aplikasi QRIS.",
      active: true,
    },
    {
      id: 4,
      kind: "ewallet",
      name: "DANA & ShopeePay",
      display_type: "account",
      account: "0812-3456-7890",
      holder: "Kingz Sparepart Computer",
      qris_image: "",
      instructions: "Bisa transfer langsung ke nomor HP e-wallet.",
      active: true,
    },
    {
      id: 5,
      kind: "cod",
      name: "COD (Bayar di Tempat)",
      display_type: "account",
      account: "-",
      holder: "Kurir Pengiriman",
      instructions: "Siapkan uang tunai pas saat kurir mengantar pesanan ke alamat Anda.",
      active: true,
    },
  ];
}

export const memoryStore = new MemoryStore();

// PostgreSQL Pool Initialization with lazy evaluation and safe fallback
let poolInstance: pg.Pool | null = null;
let pgConnected = false;
let initChecked = false;

export function getPool(): pg.Pool | null {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return null;

  if (!poolInstance) {
    try {
      poolInstance = new Pool({
        connectionString: dbUrl,
        connectionTimeoutMillis: 3000,
      });

      poolInstance.on("error", (err) => {
        console.warn("[PostgreSQL] Pool error, continuing with memory cache:", err.message);
        pgConnected = false;
      });
    } catch (e) {
      console.warn("[PostgreSQL] Failed to create pool:", e);
      poolInstance = null;
    }
  }
  return poolInstance;
}

export async function initPostgresTables() {
  if (initChecked) return pgConnected;
  initChecked = true;

  const pool = getPool();
  if (!pool) {
    console.log("[Database] Running with in-memory store (DATABASE_URL not connected)");
    return false;
  }

  try {
    const client = await pool.connect();
    pgConnected = true;
    console.log("[PostgreSQL] Connected successfully to database!");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50),
        role VARCHAR(20) DEFAULT 'pembeli',
        active BOOLEAN DEFAULT TRUE,
        password VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS shop_profile (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        badge VARCHAR(50),
        active_text VARCHAR(100),
        photo TEXT,
        tagline TEXT,
        rating VARCHAR(50),
        chat_rate VARCHAR(50),
        joined VARCHAR(50),
        products VARCHAR(50),
        chat_time VARCHAR(50),
        followers VARCHAR(50)
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price INTEGER NOT NULL,
        stock INTEGER NOT NULL,
        images JSONB NOT NULL,
        specs JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        sender VARCHAR(20) NOT NULL,
        text TEXT NOT NULL,
        time VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS testimonials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        date VARCHAR(50),
        avatar TEXT,
        media TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        buyer_name VARCHAR(255) NOT NULL,
        buyer_email VARCHAR(255) NOT NULL,
        buyer_phone VARCHAR(50),
        address TEXT,
        items JSONB NOT NULL,
        total_price INTEGER NOT NULL,
        status VARCHAR(50) DEFAULT 'Menunggu Pembayaran',
        payment_method VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS payment_methods (
        id SERIAL PRIMARY KEY,
        kind VARCHAR(20) NOT NULL,
        name VARCHAR(100) NOT NULL,
        display_type VARCHAR(20) DEFAULT 'account',
        account VARCHAR(100),
        holder VARCHAR(100),
        qris_image TEXT,
        instructions TEXT,
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed default admin if table is empty
    const adminCheck = await client.query("SELECT COUNT(*) FROM users WHERE role = 'admin'");
    if (parseInt(adminCheck.rows[0].count, 10) === 0) {
      const adminEmail = process.env.ADMIN_EMAIL || "admin@kingz.id";
      const adminPass = process.env.ADMIN_PASSWORD || "admin123456";
      const adminName = process.env.ADMIN_NAME || "Admin Kingz Sparepart";
      await client.query(
        "INSERT INTO users (name, email, phone, role, active, password) VALUES ($1, $2, $3, $4, $5, $6)",
        [adminName, adminEmail, "081200000001", "admin", true, adminPass],
      );
      console.log(`[PostgreSQL] Seeded default admin account: ${adminEmail}`);
    }

    client.release();
    return true;
  } catch (error) {
    console.warn(
      "[PostgreSQL] Connection not established, using in-memory store:",
      (error as Error).message,
    );
    pgConnected = false;
    return false;
  }
}

// Database helper functions with automatic fallback
export const db = {
  isPgConnected: () => pgConnected,

  async getUsers(): Promise<UserRow[]> {
    const pool = getPool();
    if (pgConnected && pool) {
      try {
        const res = await pool.query(
          "SELECT id, name, email, phone, role, active FROM users ORDER BY id ASC",
        );
        return res.rows;
      } catch (err) {
        console.warn("Error querying users from Postgres, fallback to memory:", err);
      }
    }
    return memoryStore.users;
  },

  async authenticate(email: string, pass: string): Promise<UserRow | null> {
    const pool = getPool();
    if (pgConnected && pool) {
      try {
        const res = await pool.query("SELECT * FROM users WHERE email = $1 AND password = $2", [
          email,
          pass,
        ]);
        if (res.rows.length > 0) return res.rows[0];
      } catch (err) {
        console.warn("Error authenticating against Postgres, fallback to memory:", err);
      }
    }

    const match = memoryStore.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && (u.password === pass || !u.password),
    );
    return match || null;
  },

  async createUser(user: Omit<UserRow, "id">): Promise<UserRow> {
    const pool = getPool();
    if (pgConnected && pool) {
      try {
        const res = await pool.query(
          "INSERT INTO users (name, email, phone, role, active, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
          [user.name, user.email, user.phone, user.role, user.active, user.password || ""],
        );
        return res.rows[0];
      } catch (err) {
        console.warn("Error inserting user into Postgres, fallback to memory:", err);
      }
    }

    const newId = Date.now();
    const newUser: UserRow = { id: newId, ...user };
    memoryStore.users.push(newUser);
    return newUser;
  },

  async updateUser(id: number, fields: Partial<UserRow>): Promise<UserRow | null> {
    const pool = getPool();
    if (pgConnected && pool) {
      try {
        const sets: string[] = [];
        const vals: unknown[] = [];
        let i = 1;
        if (fields.name !== undefined) {
          sets.push(`name = $${i++}`);
          vals.push(fields.name);
        }
        if (fields.email !== undefined) {
          sets.push(`email = $${i++}`);
          vals.push(fields.email);
        }
        if (fields.phone !== undefined) {
          sets.push(`phone = $${i++}`);
          vals.push(fields.phone);
        }
        if (fields.role !== undefined) {
          sets.push(`role = $${i++}`);
          vals.push(fields.role);
        }
        if (fields.active !== undefined) {
          sets.push(`active = $${i++}`);
          vals.push(fields.active);
        }
        vals.push(id);
        const res = await pool.query(
          `UPDATE users SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
          vals,
        );
        if (res.rows.length > 0) return res.rows[0];
      } catch (err) {
        console.warn("Error updating user in Postgres, fallback to memory:", err);
      }
    }

    const idx = memoryStore.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      memoryStore.users[idx] = { ...memoryStore.users[idx]!, ...fields };
      return memoryStore.users[idx]!;
    }
    return null;
  },

  async deleteUser(id: number): Promise<boolean> {
    const pool = getPool();
    if (pgConnected && pool) {
      try {
        await pool.query("DELETE FROM users WHERE id = $1", [id]);
        return true;
      } catch (err) {
        console.warn("Error deleting user from Postgres, fallback to memory:", err);
      }
    }

    memoryStore.users = memoryStore.users.filter((u) => u.id !== id);
    return true;
  },

  async getProducts(): Promise<ProductRow[]> {
    const pool = getPool();
    if (pgConnected && pool) {
      try {
        const res = await pool.query("SELECT * FROM products ORDER BY id ASC");
        if (res.rows.length > 0) {
          return res.rows.map((r) => ({
            id: r.id,
            name: r.name,
            price: r.price,
            stock: r.stock,
            images: typeof r.images === "string" ? JSON.parse(r.images) : r.images,
            specs: typeof r.specs === "string" ? JSON.parse(r.specs) : r.specs,
          }));
        }
      } catch (err) {
        console.warn("Error getting products from Postgres, fallback to memory:", err);
      }
    }
    return memoryStore.products;
  },

  async createProduct(p: Omit<ProductRow, "id">): Promise<ProductRow> {
    const pool = getPool();
    if (pgConnected && pool) {
      try {
        const res = await pool.query(
          "INSERT INTO products (name, price, stock, images, specs) VALUES ($1, $2, $3, $4, $5) RETURNING *",
          [p.name, p.price, p.stock, JSON.stringify(p.images), JSON.stringify(p.specs)],
        );
        return {
          id: res.rows[0].id,
          name: res.rows[0].name,
          price: res.rows[0].price,
          stock: res.rows[0].stock,
          images: res.rows[0].images,
          specs: res.rows[0].specs,
        };
      } catch (err) {
        console.warn("Error saving product to Postgres, fallback to memory:", err);
      }
    }

    const newProd = { id: Date.now(), ...p };
    memoryStore.products.push(newProd);
    return newProd;
  },

  async updateProduct(id: number, p: Partial<ProductRow>): Promise<ProductRow | null> {
    const pool = getPool();
    if (pgConnected && pool) {
      try {
        const sets: string[] = [];
        const vals: unknown[] = [];
        let i = 1;
        if (p.name !== undefined) {
          sets.push(`name = $${i++}`);
          vals.push(p.name);
        }
        if (p.price !== undefined) {
          sets.push(`price = $${i++}`);
          vals.push(p.price);
        }
        if (p.stock !== undefined) {
          sets.push(`stock = $${i++}`);
          vals.push(p.stock);
        }
        if (p.images !== undefined) {
          sets.push(`images = $${i++}`);
          vals.push(JSON.stringify(p.images));
        }
        if (p.specs !== undefined) {
          sets.push(`specs = $${i++}`);
          vals.push(JSON.stringify(p.specs));
        }
        vals.push(id);
        const res = await pool.query(
          `UPDATE products SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
          vals,
        );
        if (res.rows.length > 0) return res.rows[0];
      } catch (err) {
        console.warn("Error updating product in Postgres, fallback to memory:", err);
      }
    }

    const idx = memoryStore.products.findIndex((x) => x.id === id);
    if (idx !== -1) {
      memoryStore.products[idx] = { ...memoryStore.products[idx]!, ...p };
      return memoryStore.products[idx]!;
    }
    return null;
  },

  async deleteProduct(id: number): Promise<boolean> {
    const pool = getPool();
    if (pgConnected && pool) {
      try {
        await pool.query("DELETE FROM products WHERE id = $1", [id]);
        return true;
      } catch (err) {
        console.warn("Error deleting product from Postgres, fallback to memory:", err);
      }
    }

    memoryStore.products = memoryStore.products.filter((p) => p.id !== id);
    return true;
  },

  async getShop(): Promise<ShopRow> {
    return memoryStore.shop;
  },

  async updateShop(s: Partial<ShopRow>): Promise<ShopRow> {
    memoryStore.shop = { ...memoryStore.shop, ...s };
    return memoryStore.shop;
  },

  async getChatMessages(): Promise<ChatMessageRow[]> {
    return memoryStore.chatMessages;
  },

  async addChatMessage(sender: "seller" | "me", text: string): Promise<ChatMessageRow> {
    const time = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    const msg: ChatMessageRow = {
      id: Date.now(),
      sender,
      text,
      time,
    };
    memoryStore.chatMessages.push(msg);
    return msg;
  },

  async getTestimonials(): Promise<TestimonialRow[]> {
    return memoryStore.testimonials;
  },

  async addTestimonial(t: Omit<TestimonialRow, "id">): Promise<TestimonialRow> {
    const newTesti: TestimonialRow = { id: Date.now(), ...t };
    memoryStore.testimonials.push(newTesti);
    return newTesti;
  },

  async deleteTestimonial(id: number): Promise<boolean> {
    memoryStore.testimonials = memoryStore.testimonials.filter((t) => t.id !== id);
    return true;
  },

  async getOrders(): Promise<OrderRow[]> {
    return memoryStore.orders;
  },

  async createOrder(order: Omit<OrderRow, "id">): Promise<OrderRow> {
    const newOrder: OrderRow = { id: Date.now(), ...order };
    memoryStore.orders.push(newOrder);
    return newOrder;
  },

  async getPaymentMethods(): Promise<PaymentMethodRow[]> {
    const pool = getPool();
    if (pgConnected && pool) {
      try {
        const res = await pool.query("SELECT * FROM payment_methods ORDER BY id ASC");
        if (res.rows.length > 0) return res.rows;
      } catch (err) {
        console.warn("Error getting payment methods from Postgres:", err);
      }
    }
    return memoryStore.paymentMethods;
  },

  async createPaymentMethod(m: Omit<PaymentMethodRow, "id">): Promise<PaymentMethodRow> {
    const pool = getPool();
    if (pgConnected && pool) {
      try {
        const res = await pool.query(
          "INSERT INTO payment_methods (kind, name, display_type, account, holder, qris_image, instructions, active) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
          [
            m.kind,
            m.name,
            m.display_type || "account",
            m.account || "",
            m.holder || "",
            m.qris_image || "",
            m.instructions || "",
            m.active ?? true,
          ],
        );
        return res.rows[0];
      } catch (err) {
        console.warn("Error creating payment method in Postgres:", err);
      }
    }
    const newM: PaymentMethodRow = { id: Date.now(), ...m };
    memoryStore.paymentMethods.push(newM);
    return newM;
  },

  async updatePaymentMethod(
    id: number,
    m: Partial<PaymentMethodRow>,
  ): Promise<PaymentMethodRow | null> {
    const pool = getPool();
    if (pgConnected && pool) {
      try {
        const sets: string[] = [];
        const vals: unknown[] = [];
        let i = 1;
        if (m.kind !== undefined) {
          sets.push(`kind = $${i++}`);
          vals.push(m.kind);
        }
        if (m.name !== undefined) {
          sets.push(`name = $${i++}`);
          vals.push(m.name);
        }
        if (m.display_type !== undefined) {
          sets.push(`display_type = $${i++}`);
          vals.push(m.display_type);
        }
        if (m.account !== undefined) {
          sets.push(`account = $${i++}`);
          vals.push(m.account);
        }
        if (m.holder !== undefined) {
          sets.push(`holder = $${i++}`);
          vals.push(m.holder);
        }
        if (m.qris_image !== undefined) {
          sets.push(`qris_image = $${i++}`);
          vals.push(m.qris_image);
        }
        if (m.instructions !== undefined) {
          sets.push(`instructions = $${i++}`);
          vals.push(m.instructions);
        }
        if (m.active !== undefined) {
          sets.push(`active = $${i++}`);
          vals.push(m.active);
        }
        vals.push(id);
        const res = await pool.query(
          `UPDATE payment_methods SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`,
          vals,
        );
        if (res.rows.length > 0) return res.rows[0];
      } catch (err) {
        console.warn("Error updating payment method in Postgres:", err);
      }
    }
    const idx = memoryStore.paymentMethods.findIndex((x) => x.id === id);
    if (idx !== -1) {
      memoryStore.paymentMethods[idx] = { ...memoryStore.paymentMethods[idx]!, ...m };
      return memoryStore.paymentMethods[idx]!;
    }
    return null;
  },

  async deletePaymentMethod(id: number): Promise<boolean> {
    const pool = getPool();
    if (pgConnected && pool) {
      try {
        await pool.query("DELETE FROM payment_methods WHERE id = $1", [id]);
        return true;
      } catch (err) {
        console.warn("Error deleting payment method in Postgres:", err);
      }
    }
    memoryStore.paymentMethods = memoryStore.paymentMethods.filter((x) => x.id !== id);
    return true;
  },
};
