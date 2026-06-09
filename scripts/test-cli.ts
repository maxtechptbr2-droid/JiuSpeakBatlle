import { execSync } from 'child_process';
try {
  const out1 = execSync('pg_isready', { encoding: 'utf8' });
  console.log('pg_isready:', out1);
} catch (e: any) {
  console.log('pg_isready error:', e.message);
}
try {
  const out2 = execSync('ps -ef', { encoding: 'utf8' });
  console.log('ps -ef:', out2);
} catch (e: any) {
  console.log('ps error:', e.message);
}
try {
  const out3 = execSync('which psql', { encoding: 'utf8' });
  console.log('which psql:', out3);
} catch (e: any) {
  console.log('which psql error:', e.message);
}
