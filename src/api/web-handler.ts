import { db, initPostgresTables } from "../db/index";

export async function handleApiFetch(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (!path.startsWith("/api")) {
    return null;
  }

  initPostgresTables().catch((err) => console.warn(err));

  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    if (path === "/api/health" && request.method === "GET") {
      return Response.json(
        {
          status: "ok",
          app: "Kingz Sparepart Computer",
          backend: "Express.js & PostgreSQL",
          database: db.isPgConnected()
            ? "PostgreSQL (Connected)"
            : "PostgreSQL (Fallback / Memory Ready)",
          port: process.env.PORT || 3000,
          timestamp: new Date().toISOString(),
        },
        { headers },
      );
    }

    if (path === "/api/auth/login" && request.method === "POST") {
      const { email, password } = (await request.json().catch(() => ({}))) as {
        email?: string;
        password?: string;
      };
      if (!email || !password) {
        return Response.json(
          { error: "Email dan kata sandi wajib diisi" },
          { status: 400, headers },
        );
      }

      const adminEmail = process.env.ADMIN_EMAIL || "admin@kingz.id";
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123456";

      if (email.toLowerCase() === adminEmail.toLowerCase() && password === adminPassword) {
        return Response.json(
          {
            token: `jwt-admin-${Date.now()}`,
            user: {
              id: 1,
              name: process.env.ADMIN_NAME || "Admin Kingz",
              email: adminEmail,
              phone: "081200000001",
              role: "admin",
              active: true,
            },
          },
          { headers },
        );
      }

      const user = await db.authenticate(email, password);
      if (!user) {
        return Response.json({ error: "Email atau kata sandi salah" }, { status: 401, headers });
      }
      if (!user.active) {
        return Response.json({ error: "Akun ini sedang dinonaktifkan" }, { status: 403, headers });
      }

      return Response.json(
        {
          token: `jwt-token-${user.id}-${Date.now()}`,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            active: user.active,
          },
        },
        { headers },
      );
    }

    if (path === "/api/auth/register" && request.method === "POST") {
      const { name, email, phone, password } = (await request.json().catch(() => ({}))) as {
        name?: string;
        email?: string;
        phone?: string;
        password?: string;
      };
      if (!name || !email || !password) {
        return Response.json({ error: "Data registrasi tidak lengkap" }, { status: 400, headers });
      }

      const newUser = await db.createUser({
        name,
        email,
        phone: phone || "",
        role: "pembeli",
        active: true,
        password,
      });

      return Response.json(
        {
          token: `jwt-token-${newUser.id}-${Date.now()}`,
          user: newUser,
        },
        { status: 201, headers },
      );
    }

    if (path === "/api/products" && request.method === "GET") {
      const products = await db.getProducts();
      return Response.json(products, { headers });
    }

    if (path === "/api/products" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as {
        name?: string;
        price?: number;
        stock?: number;
        images?: string[];
        specs?: Record<string, unknown>;
      };
      if (!body.name || body.price === undefined) {
        return Response.json(
          { error: "Nama dan harga produk wajib diisi" },
          { status: 400, headers },
        );
      }
      const prod = await db.createProduct({
        name: body.name,
        price: Number(body.price),
        stock: Number(body.stock) || 0,
        images: body.images || [],
        specs: body.specs || {
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
      return Response.json(prod, { status: 201, headers });
    }

    if (path.startsWith("/api/products/") && request.method === "PUT") {
      const id = Number(path.replace("/api/products/", ""));
      const body = await request.json().catch(() => ({}));
      const updated = await db.updateProduct(id, body);
      if (!updated)
        return Response.json({ error: "Produk tidak ditemukan" }, { status: 404, headers });
      return Response.json(updated, { headers });
    }

    if (path.startsWith("/api/products/") && request.method === "DELETE") {
      const id = Number(path.replace("/api/products/", ""));
      await db.deleteProduct(id);
      return Response.json({ success: true }, { headers });
    }

    if (path === "/api/users" && request.method === "GET") {
      const users = await db.getUsers();
      return Response.json(users, { headers });
    }

    if (path === "/api/users" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const created = await db.createUser({
        name: body.name,
        email: body.email,
        phone: body.phone || "",
        role: body.role || "pembeli",
        active: body.active !== undefined ? Boolean(body.active) : true,
        password: body.password || "password123",
      });
      return Response.json(created, { status: 201, headers });
    }

    if (path.startsWith("/api/users/") && request.method === "PUT") {
      const id = Number(path.replace("/api/users/", ""));
      const body = await request.json().catch(() => ({}));
      const updated = await db.updateUser(id, body);
      if (!updated)
        return Response.json({ error: "User tidak ditemukan" }, { status: 404, headers });
      return Response.json(updated, { headers });
    }

    if (path.startsWith("/api/users/") && request.method === "DELETE") {
      const id = Number(path.replace("/api/users/", ""));
      await db.deleteUser(id);
      return Response.json({ success: true }, { headers });
    }

    if (path === "/api/shop" && request.method === "GET") {
      const shop = await db.getShop();
      return Response.json(shop, { headers });
    }

    if (path === "/api/shop" && request.method === "PUT") {
      const body = await request.json().catch(() => ({}));
      const updated = await db.updateShop(body);
      return Response.json(updated, { headers });
    }

    if (path === "/api/chat" && request.method === "GET") {
      const messages = await db.getChatMessages();
      return Response.json(messages, { headers });
    }

    if (path === "/api/chat" && request.method === "POST") {
      const body = (await request.json().catch(() => ({}))) as {
        sender?: "seller" | "me";
        text?: string;
      };
      if (!body.text)
        return Response.json({ error: "Pesan tidak boleh kosong" }, { status: 400, headers });
      const msg = await db.addChatMessage(body.sender || "me", body.text);

      if (body.sender === "me") {
        setTimeout(async () => {
          let reply =
            "Halo kak, terima kasih atas pertanyaannya! Tim Kingz siap membantu pesanan Anda.";
          const t = body.text?.toLowerCase() || "";
          if (t.includes("ready") || t.includes("stok")) {
            reply = "Barang ready kak! Siap kirim hari ini dengan bubble wrap tebal bergaransi.";
          } else if (t.includes("garansi")) {
            reply = "Garansi produk 3 hingga 6 bulan ganti unit baru bila ada kendala.";
          }
          await db.addChatMessage("seller", reply);
        }, 800);
      }

      return Response.json(msg, { status: 201, headers });
    }

    if (path === "/api/testimonials" && request.method === "GET") {
      const list = await db.getTestimonials();
      return Response.json(list, { headers });
    }

    if (path === "/api/testimonials" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const date =
        new Date().toISOString().slice(0, 10) +
        " " +
        new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
      const created = await db.addTestimonial({
        name: body.name || "Pelanggan",
        rating: Number(body.rating) || 5,
        comment: body.comment || "",
        date,
        avatar: body.avatar || "",
        media: body.media || "",
      });
      return Response.json(created, { status: 201, headers });
    }

    if (path.startsWith("/api/testimonials/") && request.method === "DELETE") {
      const id = Number(path.replace("/api/testimonials/", ""));
      await db.deleteTestimonial(id);
      return Response.json({ success: true }, { headers });
    }

    if (path === "/api/orders" && request.method === "GET") {
      const orders = await db.getOrders();
      return Response.json(orders, { headers });
    }

    if (path === "/api/orders" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      const order = await db.createOrder({
        buyer_name: body.buyer_name || "Pembeli",
        buyer_email: body.buyer_email || "",
        buyer_phone: body.buyer_phone || "",
        address: body.address || "",
        items: body.items || [],
        total_price: Number(body.total_price) || 0,
        status: "Diproses",
        payment_method: body.payment_method || "BCA Virtual Account",
      });
      return Response.json(order, { status: 201, headers });
    }

    // Payment methods
    if (path === "/api/payments" && request.method === "GET") {
      const methods = await db.getPaymentMethods();
      return Response.json(methods, { headers });
    }

    if (path === "/api/payments" && request.method === "POST") {
      const body = await request.json().catch(() => ({}));
      if (!body.name) {
        return Response.json(
          { error: "Nama metode pembayaran wajib diisi" },
          { status: 400, headers },
        );
      }
      const created = await db.createPaymentMethod({
        kind: body.kind || "bank",
        name: body.name,
        display_type: body.display_type || "account",
        account: body.account || "",
        holder: body.holder || "",
        qris_image: body.qris_image || "",
        instructions: body.instructions || "",
        active: body.active !== undefined ? Boolean(body.active) : true,
      });
      return Response.json(created, { status: 201, headers });
    }

    if (path.startsWith("/api/payments/") && request.method === "PUT") {
      const id = Number(path.replace("/api/payments/", ""));
      const body = await request.json().catch(() => ({}));
      const updated = await db.updatePaymentMethod(id, body);
      if (!updated)
        return Response.json(
          { error: "Metode pembayaran tidak ditemukan" },
          { status: 404, headers },
        );
      return Response.json(updated, { headers });
    }

    if (path.startsWith("/api/payments/") && request.method === "DELETE") {
      const id = Number(path.replace("/api/payments/", ""));
      await db.deletePaymentMethod(id);
      return Response.json({ success: true }, { headers });
    }

    return Response.json({ error: "Endpoint tidak ditemukan" }, { status: 404, headers });
  } catch (err) {
    console.error("API Error:", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500, headers });
  }
}
