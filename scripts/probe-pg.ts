import { execSync } from 'child_process';
import fs from 'fs';

console.log("Checking PATH for pg_ctl and initdb...");
const commands = ["pg_ctl", "initdb", "postgres", "psql"];
for (const cmd of commands) {
  try {
    const out = execSync(`which ${cmd}`, { encoding: 'utf8' }).trim();
    console.log(`Command '${cmd}' found at: ${out}`);
  } catch (e) {
    console.log(`Command '${cmd}' NOT found in PATH`);
  }
}

console.log("\nChecking typical Debian/Ubuntu locations for postgresql binaries...");
const possibleDirs = [
  "/usr/lib/postgresql/16/bin",
  "/usr/lib/postgresql/15/bin",
  "/usr/lib/postgresql/14/bin",
  "/usr/lib/postgresql/13/bin",
  "/usr/lib/postgresql/12/bin",
  "/usr/bin",
  "/bin"
];

for (const dir of possibleDirs) {
  if (fs.existsSync(dir)) {
    console.log(`Directory exists: ${dir}`);
    try {
      const files = fs.readdirSync(dir);
      console.log(`  Contains: ${files.filter(f => f.includes("pg") || f.includes("init") || f.includes("post")).join(", ")}`);
    } catch (e: any) {
      console.log(`  Could not read directory: ${e.message}`);
    }
  } else {
    console.log(`Directory does not exist: ${dir}`);
  }
}
