import { execSync } from 'child_process';

console.log("Searching filesystem for 'pg_ctl'...");
try {
  const out = execSync("find /usr -name pg_ctl -type f 2>/dev/null", { encoding: "utf8" });
  console.log("Found pg_ctl:", out);
} catch (e: any) {
  console.log("Error finding pg_ctl:", e.message);
}

try {
  const out2 = execSync("find /var -name pg_ctl -type f 2>/dev/null", { encoding: "utf8" });
  console.log("Found pg_ctl in /var:", out2);
} catch (e: any) {
  console.log("Error finding pg_ctl in /var:", e.message);
}

console.log("Searching filesystem for 'postgres'...");
try {
  const out3 = execSync("find /usr -name postgres -type f 2>/dev/null", { encoding: "utf8" });
  console.log("Found postgres:", out3);
} catch (e: any) {
  console.log("Error finding postgres:", e.message);
}
