export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureDb } = await import("./lib/migrate");
    await ensureDb();
  }
}
