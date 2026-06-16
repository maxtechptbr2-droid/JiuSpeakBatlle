import * as fs from "fs";
import * as path from "path";

const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf8");
  console.log("=== .ENV FILE CONTENTS (MASKED) ===");
  content.split("\n").forEach(line => {
    if (line.includes("=")) {
      const [key, ...rest] = line.split("=");
      const val = rest.join("=");
      const masked = val.length > 8 ? val.substring(0, 4) + "..." + val.substring(val.length - 4) : "***";
      console.log(`${key}=${masked}`);
    } else {
      console.log(line);
    }
  });
} else {
  console.log(".env file does not exist at", envPath);
}
