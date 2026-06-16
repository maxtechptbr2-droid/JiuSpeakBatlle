import { execSync } from 'child_process';
import * as fs from 'fs';

async function generateBackup() {
  console.log("=== INICIANDO BACKUP DE SEGURANÇA ===");
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("Erro: DATABASE_URL não encontrada no ambiente.");
    process.exit(1);
  }

  const targetPath = "/backup_before_cleanup.sql";
  try {
    console.log(`[+] Executando pg_dump para ${targetPath}...`);
    execSync(`pg_dump "${dbUrl}" -F p > "${targetPath}"`, { stdio: 'inherit' });
    console.log(`[+] Backup gerado com sucesso em: ${targetPath}`);
    
    // Validar integridade
    if (fs.existsSync(targetPath)) {
      const stats = fs.statSync(targetPath);
      console.log(`[+] Tamanho do arquivo de backup: ${stats.size} bytes`);
      if (stats.size > 100) {
        console.log("=== BACKUP VALIDADO COM SUCESSO COBRINDO METADADOS ===");
      } else {
        console.error("[-] Alerta: O arquivo de backup está vazio ou muito pequeno.");
        process.exit(1);
      }
    } else {
      console.error("[-] Erro: Arquivo de backup não pôde ser encontrado.");
      process.exit(1);
    }
  } catch (err: any) {
    console.error("[-] Falha ao executar backup via pg_dump:", err.message);
    process.exit(1);
  }
}

generateBackup();
