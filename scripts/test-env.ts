console.log("Environment keys:", Object.keys(process.env).filter(k => k.includes("SQL") || k.includes("DB") || k.includes("DATABASE") || k.includes("USER")));
console.log("DATABASE_URL present:", !!process.env.DATABASE_URL);
console.log("SQL_HOST present:", !!process.env.SQL_HOST);
console.log("SQL_PORT present:", !!process.env.SQL_PORT);
