import fs from 'fs';
import path from 'path';

const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
let schema = fs.readFileSync(schemaPath, 'utf8');

// 1. Change datasource provider and url
console.log("Converting datasource provider to sqlite...");
schema = schema.replace(
  /datasource db \{[\s\S]*?\}/,
  `datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}`
);

// 2. Identify all enums to prepare replacement
const enumNames = [
  "UserRole",
  "BeltRank",
  "TransactionType",
  "TransactionStatus",
  "PaymentStatus",
  "WithdrawalStatus",
  "SubscriptionStatus",
  "Rarity",
  "PvpMatchStatus",
  "NotificationType",
  "AuditActionType"
];

// 3. Remove enum definitions
console.log("Removing enum definitions...");
for (const enumName of enumNames) {
  const enumRegex = new RegExp(`enum\\s+${enumName}\\s*\\{[\\s\\S]*?\\}`, 'g');
  schema = schema.replace(enumRegex, '');
}

// 4. Replace enum fields in models to String with defaults properly quoted
console.log("Replacing enum fields in models...");
// Standardize default enum values like @default(ATHLETE) -> @default("ATHLETE")
for (const enumName of enumNames) {
  // Replace references like Name EnumName @default(VALUE) -> Name String @default("VALUE")
  const regexWithDefault = new RegExp(`(\\w+\\s+)${enumName}(\\s+@default\\()(\\w+)(\\))`, 'g');
  schema = schema.replace(regexWithDefault, '$1String$2"$3"$4');

  // Replace references like Name EnumName? -> Name String?
  const regexOptional = new RegExp(`(\\w+\\s+)${enumName}(\\?)`, 'g');
  schema = schema.replace(regexOptional, '$1String$2');

  // Replace plain references like Name EnumName -> Name String
  const regexPlain = new RegExp(`(\\s+)(\\w+)(\\s+)${enumName}(\\s|\\n|$)`, 'g');
  schema = schema.replace(regexPlain, '$1$2$3String$4');
}

// 5. Remove postgres-specific annotations like @db.Decimal(12, 2) and @db.Text
console.log("Removing PostgreSQL specific @db annotations...");
schema = schema.replace(/@db\.Decimal\(\s*\d+\s*,\s*\d+\s*\)/g, '');
schema = schema.replace(/@db\.Text/g, '');

// 6. Replace string array (features String[]) with String @default("[]") for SQLite compatibility
console.log("Replacing features String[] with features String @default(\"[]\")...");
schema = schema.replace(/features\s+String\[\][^\n]*/g, 'features    String   @default("[]") // JSON-encoded features array for SQLite');

// Save converted schema
fs.writeFileSync(schemaPath, schema);
console.log("Prisma schema converted successfully to SQLite!");
