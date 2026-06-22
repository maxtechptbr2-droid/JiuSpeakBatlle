import { execSync } from "child_process";
import fs from "fs";
import path from "path";

async function main() {
  const binDir = "/app/applet/pg_local/usr/lib/postgresql/15/bin";
  const dataDir = "/tmp/pg_data";
  const logFile = "/tmp/pg.log";

  console.log("=== START UNPRIVILEGED PORTABLE POSTGRES IN /tmp ===");

  // 1. Create data directory
  if (!fs.existsSync(dataDir)) {
    console.log(`Creating data directory ${dataDir}...`);
    fs.mkdirSync(dataDir, { recursive: true });
  }

  // Set permissions so nobody can write to it
  execSync(`chmod 777 ${dataDir}`);
  try {
    execSync(`chown nobody ${dataDir}`);
  } catch (e: any) {
    console.log("chown to nobody warning:", e.message);
  }

  // 2. Initialize database if not already initialized
  const versionFile = path.join(dataDir, "PG_VERSION");
  if (!fs.existsSync(versionFile)) {
    console.log("Initializing database cluster in /tmp/pg_data...");
    const initCmd = `su -s /bin/bash nobody -c "${binDir}/initdb -D ${dataDir} -U root --auth-local=trust --auth-host=trust"`;
    console.log("Running:", initCmd);
    execSync(initCmd, { stdio: "inherit" });
  } else {
    // Stale PID?
    const pidFile = path.join(dataDir, "postmaster.pid");
    if (fs.existsSync(pidFile)) {
      console.log("Unlinking stale postmaster.pid from /tmp/pg_data...");
      fs.unlinkSync(pidFile);
    }
  }

  // 3. Start PostgreSQL as nobody
  console.log("Starting PostgreSQL as nobody...");
  const startCmd = `su -s /bin/bash nobody -c "${binDir}/postgres -D ${dataDir} -k /tmp -p 5432 > ${logFile} 2>&1 &"`;
  console.log("Running:", startCmd);
  execSync(startCmd);

  // 4. Wait for PG to start
  console.log("Waiting for database connection...");
  for (let i = 0; i < 5; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      execSync(`${binDir}/pg_isready -h /tmp -p 5432`);
      console.log("✅ PostgreSQL is ready!");
      break;
    } catch {
      console.log("Still waiting...");
    }
  }

  // Print logs if failed
  if (fs.existsSync(logFile)) {
    console.log("--- PG LOGS ---");
    console.log(fs.readFileSync(logFile, "utf8"));
    console.log("---------------");
  }

  // 5. Create jiuspeak_db
  console.log("Creating database jiuspeak_db...");
  const psqlBase = `su -s /bin/bash nobody -c "${binDir}/psql -h /tmp -p 5432 -U root -d postgres -c %SQL_COMMAND%"`;
  try {
    execSync(psqlBase.replace("%SQL_COMMAND%", `"CREATE DATABASE jiuspeak_db;"`), { stdio: "inherit" });
    console.log("Database jiuspeak_db created successfully!");
  } catch (e: any) {
    console.log("Note: Database might already exist:", e.message);
  }
}

main().catch(e => {
  console.error("Master start failed:", e);
});
