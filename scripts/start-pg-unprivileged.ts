import { execSync } from "child_process";
import fs from "fs";
import path from "path";

async function main() {
  const pgDir = path.join(process.cwd(), "pg_local");
  const binDir = path.join(pgDir, "usr/lib/postgresql/15/bin");
  const dataDir = path.join(pgDir, "data");
  const logFile = path.join(pgDir, "pg.log");

  console.log("=== START UNPRIVILEGED POSTGRES ===");

  try {
    // 1. Check if nobody group or nogroup exists
    let userGroup = "nobody:nogroup";
    try {
      execSync("id -g nobody", { stdio: "ignore" });
      // on some systems nobody has nogroup
      try {
        execSync("getent group nogroup", { stdio: "ignore" });
        userGroup = "nobody:nogroup";
      } catch {
        userGroup = "nobody";
      }
    } catch {
      userGroup = "nobody";
    }

    console.log(`Setting owner of ${pgDir} to ${userGroup}...`);
    try {
      execSync(`chown -R ${userGroup} ${pgDir}`, { stdio: "inherit" });
    } catch (e: any) {
      console.log("chown failed:", e.message);
    }

    // 2. Data directory permissions MUST be 700 and owned by the running user
    console.log("Setting database folder permissions to 0700...");
    execSync(`chmod 700 ${dataDir}`, { stdio: "inherit" });
    try {
      execSync(`chown -R ${userGroup} ${dataDir}`, { stdio: "inherit" });
    } catch (e: any) {
      console.log("chown of dataDir failed:", e.message);
    }

    // 3. Start PG as nobody
    console.log("Starting PostgreSQL...");
    // Stop first if running
    try {
      execSync(`su -s /bin/bash nobody -c "${binDir}/pg_ctl -D ${dataDir} stop"`, { stdio: "ignore" });
    } catch {}

    const startCmd = `su -s /bin/bash nobody -c "${binDir}/pg_ctl -D ${dataDir} -l ${logFile} start"`;
    console.log("Running start command:", startCmd);
    execSync(startCmd, { stdio: "inherit" });

    // Wait and verify
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log("Postgres status log:");
    if (fs.existsSync(logFile)) {
      console.log(fs.readFileSync(logFile, "utf8"));
    }

    // Create database jiuspeak_db
    console.log("Creating database 'jiuspeak_db'...");
    const psqlCmd = `su -s /bin/bash nobody -c "${binDir}/psql -h localhost -p 5432 -U root -d postgres -c \\"CREATE DATABASE jiuspeak_db;\\""`;
    try {
      execSync(psqlCmd, { stdio: "inherit" });
      console.log("Database created successfully!");
    } catch (e: any) {
      console.log("Database folder might already exist or creation failed:", e.message);
    }

  } catch (err: any) {
    console.error("❌ Failed unprivileged start:", err.message || err);
  }
}

main();
