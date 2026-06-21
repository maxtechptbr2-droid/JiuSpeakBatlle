import { execSync } from "child_process";

try {
  console.log("Checking system services...");
  try {
    const out = execSync("service --status-all", { encoding: "utf8" });
    console.log("Services status:\n", out);
  } catch (e: any) {
    console.log("Error running service --status-all:", e.message);
  }

  try {
    const out2 = execSync("apt-cache policy postgresql", { encoding: "utf8" });
    console.log("Postgresql policy:\n", out2);
  } catch (e: any) {
    console.log("Error with apt-cache:", e.message);
  }

  try {
    const out3 = execSync("dpkg -l | grep postgres", { encoding: "utf8" });
    console.log("Installed postgres packages:\n", out3);
  } catch (e: any) {
    console.log("No postgres packages found via dpkg:", e.message);
  }
} catch (err: any) {
  console.error("Diagnostic error:", err);
}
