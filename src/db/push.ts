import { initPostgresTables } from "./index.ts";

async function runPush() {
  console.log("Pushing database schema and initializing tables...");
  const connected = await initPostgresTables();
  if (connected) {
    console.log("Database push completed successfully!");
  } else {
    console.log(
      "Database push ran, but DATABASE_URL was not set or connection failed (fallback to memory store active).",
    );
  }
  process.exit(0);
}

runPush().catch((err) => {
  console.error("Error during database push:", err);
  process.exit(1);
});
