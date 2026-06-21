import { execSync } from "child_process";
import fs from "fs";
import path from "path";

async function main() {
  console.log("=== USER-SPACE POSTGRES INSTALLER ===");
  const pgDir = path.join(process.cwd(), "pg_local");
  const dataDir = path.join(pgDir, "data");
  const logFile = path.join(pgDir, "pg.log");

  try {
    if (!fs.existsSync(pgDir)) {
      fs.mkdirSync(pgDir, { recursive: true });
    }

    console.log("1. Downloading packages...");
    execSync("apt-get update", { stdio: "inherit" });
    execSync("apt-get download postgresql-15 postgresql-client-15 postgresql-common libpq5", { cwd: pgDir, stdio: "inherit" });

    console.log("2. Extracting packages locally...");
    const debs = fs.readdirSync(pgDir).filter(f => f.endsWith(".deb"));
    for (const deb of debs) {
      console.log(`Extracting ${deb}...`);
      execSync(`dpkg -x ${deb} .`, { cwd: pgDir, stdio: "inherit" });
    }

    console.log("3. Adjusting PATH to include local postgres binaries...");
    const binDir = path.join(pgDir, "usr/lib/postgresql/15/bin");
    if (!fs.existsSync(binDir)) {
      console.error("Could not find postgres bin directory inside extracted packages at:", binDir);
      return;
    }

    console.log("4. Creating local PostgreSQL cluster...");
    // initdb needs to run as non-root / current user, but since some environments might complain about running postgres as root,
    // we can use --username=root and do it under the current user. Postgres 15+ allows running as root if we bypass check or run as current user.
    // Let's run initdb
    const initdbCmd = `${binDir}/initdb -D ${dataDir} -U root --auth-local=trust --auth-host=trust`;
    // If we are root, initdb will say: "cannot be run as root". Let's run it as postgres user or CNB_USER_ID if available, or using user 'nobody'
    // But since pgDir is owned by root, nobody might not have write permission. Let's make sure it's writable by everyone.
    execSync(`chmod -R 777 ${pgDir}`);

    let runAsUserCmd = initdbCmd;
    try {
      execSync(initdbCmd, { stdio: "inherit" });
    } catch (e: any) {
      console.log("Failed running initdb as root, trying as postgres user or nobody...");
      try {
        execSync(`su - postgres -c "${binDir}/initdb -D ${dataDir} -U root --auth-local=trust"`, { stdio: "inherit" });
      } catch (e2: any) {
        console.log("Failed as postgres, trying as nobody...");
        execSync(`su - nobody -s /bin/bash -c "${binDir}/initdb -D ${dataDir} -U root --auth-local=trust"`, { stdio: "inherit" });
      }
    }

    console.log("5. Starting local PostgreSQL daemon...");
    const startCmd = `${binDir}/pg_ctl -D ${dataDir} -l ${logFile} start`;
    try {
      execSync(startCmd, { stdio: "inherit" });
    } catch (e: any) {
      console.log("Failed pg_ctl, trying to start daemon via postgres command directly...");
      execSync(`${binDir}/postgres -D ${dataDir} > ${logFile} 2>&1 &`, { stdio: "inherit" });
    }

    // Wait for startup
    console.log("Waiting for PostgreSQL to start...");
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log("6. Creating database jiuspeak_db...");
    const psqlBin = `${binDir}/psql`;
    execSync(`${psqlBin} -h localhost -U root -d postgres -c "CREATE DATABASE jiuspeak_db;"`, { stdio: "inherit" });

    console.log("🎉 Local space-user database jiuspeak_db is up and running successfully!");
  } catch (err: any) {
    console.error("❌ Local PG installation failed:", err.message || err);
  }
}

main();
