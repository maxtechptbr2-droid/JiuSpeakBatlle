console.log("Environment keys:", Object.keys(process.env).filter(k => k.includes("SQL") || k.includes("DB") || k.includes("DATABASE") || k.includes("USER")));
console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);

if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log("DB Host:", url.hostname);
    console.log("DB Port:", url.port || "5432");
    console.log("DB Username:", url.username);
    console.log("DB Database:", url.pathname);
  } catch (e: any) {
    console.log("Error parsing DATABASE_URL:", e.message);
  }
}
