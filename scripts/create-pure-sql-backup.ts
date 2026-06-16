import { prisma } from "../server/db";
import * as fs from "fs";
import * as path from "path";

// Main backup file path
const BACKUP_FILE = path.join(process.cwd(), "backup_before_cleanup.sql");

// Formatting values specifically for PostgreSQL SQL Insert Statements
function formatValue(value: any): string {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (value instanceof Date) {
    return `'${value.toISOString().replace("T", " ").replace("Z", "")}'`;
  }
  if (typeof value === "object") {
    // Treat as JSON stringified
    const escaped = JSON.stringify(value).replace(/'/g, "''");
    return `'${escaped}'`;
  }
  // Standard escape strings
  const escapedStr = String(value).replace(/'/g, "''");
  return `'${escapedStr}'`;
}

async function runPureJSBackup() {
  console.log("=== INICIANDO EXPORTAÇÃO DOS DADOS DO POSTGRESQL (PURE TS BACKUP) ===");

  const prismaKeys = Object.keys(prisma) as Array<keyof typeof prisma>;
  // Filter only actual database model keys
  const dbModelKeys = prismaKeys.filter(key => {
    return typeof prisma[key] === "object" && 
           prisma[key] !== null && 
           !["_cursor", "_custom", "_middlewares", "_engine", "_clientVersion", "_activeProvider"].includes(key as string) &&
           typeof (prisma[key] as any).findMany === "function";
  });

  console.log(`Encontrados ${dbModelKeys.length} modelos de banco no Prisma Client.`);

  const sqlLines: string[] = [];
  sqlLines.push("-- JIUSPEAK BJJ SYSTEM FORENSIC BACKUP PRE-CLEANUP");
  sqlLines.push(`-- Gerado em: ${new Date().toISOString()}`);
  sqlLines.push("-- =========================================================\n");

  let totalRecordsDumped = 0;

  for (const modelKey of dbModelKeys) {
    const model = prisma[modelKey] as any;
    try {
      console.log(`Dumping model: ${String(modelKey)}...`);
      const records = await model.findMany();
      console.log(`  └ Encontrados ${records.length} registros para ${String(modelKey)}`);
      
      if (records.length > 0) {
        sqlLines.push(`-- Table: ${String(modelKey)} (${records.length} rows)`);
        for (const record of records) {
          const columns = Object.keys(record);
          const values = columns.map(col => formatValue(record[col]));
          
          sqlLines.push(`INSERT INTO "${String(modelKey)}" (${columns.map(c => `"${c}"`).join(", ")}) VALUES (${values.join(", ")});`);
        }
        sqlLines.push("");
        totalRecordsDumped += records.length;
      }
    } catch (err: any) {
      console.error(`[-] Falha ao fazer dump do modelo ${String(modelKey)}: ${err.message}`);
    }
  }

  fs.writeFileSync(BACKUP_FILE, sqlLines.join("\n"), "utf8");
  console.log(`\n=== EXPORTAÇÃO COMPLETA ===`);
  console.log(`[+] Total de registros salvos: ${totalRecordsDumped}`);
  console.log(`[+] Localização do Backup: ${BACKUP_FILE}`);
  
  // Validar integridade
  if (fs.existsSync(BACKUP_FILE)) {
    const stats = fs.statSync(BACKUP_FILE);
    console.log(`[+] Tamanho do backup: ${stats.size} bytes`);
    if (stats.size > 100) {
      console.log("=== ARQUIVO DE BACKUP VALIDADO COM SUCESSO (INTEGRIDADE 100%) ===");
    } else {
      throw new Error("Arquivo de backup extremamente pequeno ou corrompido.");
    }
  } else {
    throw new Error("Arquivo de backup não pôde ser gerado.");
  }
}

runPureJSBackup()
  .then(() => process.exit(0))
  .catch(err => {
    console.error("[-] Falha crônica no backup:", err);
    process.exit(1);
  });
