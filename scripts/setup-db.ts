import { execSync } from "child_process";

async function main() {
  console.log("=== DB SETUP SCRIPT STARTING ===");
  try {
    console.log("1. Running apt-get update...");
    execSync("apt-get update", { stdio: "inherit" });

    console.log("2. Installing postgresql...");
    execSync("apt-get install -y postgresql postgresql-contrib", { stdio: "inherit" });

    console.log("3. Starting postgresql service...");
    execSync("service postgresql start", { stdio: "inherit" });

    console.log("4. Creating role and database...");
    // Let's create database user 'root' with password '98922678baboaA-40' and database 'jiuspeak_db'
    const setupSql = `
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'root') THEN
          CREATE ROLE root WITH SUPERUSER LOGIN PASSWORD '98922678baboaA-40';
        ELSE
          ALTER ROLE root WITH PASSWORD '98922678baboaA-40';
        END IF;
      END
      $$;
    `;
    execSync(`su - postgres -c "psql -c \\"${setupSql}\\""`, { stdio: "inherit" });

    // Create database jiuspeak_db
    const createDbSql = `
      SELECT 'CREATE DATABASE jiuspeak_db'
      WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'jiuspeak_db')\\gexec
    `;
    execSync(`su - postgres -c "psql -c \\"${createDbSql}\\""`, { stdio: "inherit" });

    console.log("✅ Database and user 'root' created successfully!");
  } catch (err: any) {
    console.error("❌ Setup failed with error:", err.message || err);
  }
}

main();
