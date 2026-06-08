const dbUrl = process.env.DATABASE_URL;
if (dbUrl) {
  try {
    const url = new URL(dbUrl);
    console.log("Protocol:", url.protocol);
    console.log("Host:", url.host);
    console.log("Username:", url.username);
    console.log("Pathname (DB Name):", url.pathname);
  } catch (e: any) {
    console.error("Parse Error:", e.message);
  }
} else {
  console.log("No DATABASE_URL");
}
