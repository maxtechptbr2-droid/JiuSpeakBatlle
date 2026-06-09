import { execSync } from 'child_process';
try {
  console.log("Running apt-get update...");
  const out1 = execSync('apt-get update', { encoding: 'utf8' });
  console.log(out1);
  console.log("Installing postgres...");
  const out2 = execSync('apt-get install -y postgresql postgresql-contrib', { encoding: 'utf8' });
  console.log(out2);
} catch (err: any) {
  console.error("Error:", err.message, err.stdout, err.stderr);
}
