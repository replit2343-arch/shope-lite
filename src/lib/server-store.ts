import { createServerFn } from "@tanstack/react-start";
import { db, initPostgresTables } from "@/db/index";

export const getStoreServerData = createServerFn({ method: "GET" }).handler(async () => {
  await initPostgresTables().catch(() => {});
  const [shop, products, testimonials] = await Promise.all([
    db.getShop(),
    db.getProducts(),
    db.getTestimonials(),
  ]);
  return { shop, products, testimonials };
});

export const getTestimonialsServerData = createServerFn({ method: "GET" }).handler(async () => {
  await initPostgresTables().catch(() => {});
  return await db.getTestimonials();
});

export const getChatServerData = createServerFn({ method: "GET" }).handler(async () => {
  await initPostgresTables().catch(() => {});
  return await db.getChatMessages();
});

export const getPaymentsServerData = createServerFn({ method: "GET" }).handler(async () => {
  await initPostgresTables().catch(() => {});
  return await db.getPaymentMethods();
});
