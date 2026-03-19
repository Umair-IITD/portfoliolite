import * as SQLite from "expo-sqlite";

// ─── Types ────────────────────────────────────────────────────────

export type AssetType =
  | "mutual_fund"
  | "stock"
  | "gold"
  | "fd"
  | "crypto"
  | "ppf"
  | "real_estate"
  | "cash";

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
  currency: string;
  notes: string | null;
  createdAt: number;
  updatedAt: number;
}

export type AssetInput = Omit<Asset, "id" | "createdAt" | "updatedAt">;

export interface Snapshot {
  id: string;
  totalValue: number;
  assetBreakdown: Record<string, number>;
  capturedAt: number;
}

// ─── Database instance ────────────────────────────────────────────

let db: SQLite.SQLiteDatabase | null = null;

export function getDb(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync("portfoliolite.db");
  }
  return db;
}

// ─── Init & Migrations ────────────────────────────────────────────

export async function initDatabase(): Promise<void> {
  const database = getDb();

  database.execSync(`
    CREATE TABLE IF NOT EXISTS assets (
      id            TEXT PRIMARY KEY NOT NULL,
      name          TEXT NOT NULL,
      type          TEXT NOT NULL CHECK(type IN (
                      'mutual_fund','stock','gold','fd',
                      'crypto','ppf','real_estate','cash'
                    )),
      quantity      REAL NOT NULL DEFAULT 1,
      buy_price     REAL NOT NULL DEFAULT 0,
      current_price REAL NOT NULL DEFAULT 0,
      currency      TEXT NOT NULL DEFAULT 'INR',
      notes         TEXT,
      created_at    INTEGER NOT NULL,
      updated_at    INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS snapshots (
      id               TEXT PRIMARY KEY NOT NULL,
      total_value      REAL NOT NULL,
      asset_breakdown  TEXT NOT NULL,
      captured_at      INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );
  `);

  console.log("[DB] Initialised successfully");
}

// ─── Helpers ──────────────────────────────────────────────────────

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Map DB row (snake_case) → Asset (camelCase)
function rowToAsset(row: Record<string, unknown>): Asset {
  return {
    id:           row.id           as string,
    name:         row.name         as string,
    type:         row.type         as AssetType,
    quantity:     row.quantity     as number,
    buyPrice:     row.buy_price    as number,
    currentPrice: row.current_price as number,
    currency:     row.currency     as string,
    notes:        row.notes        as string | null,
    createdAt:    row.created_at   as number,
    updatedAt:    row.updated_at   as number,
  };
}

// ─── Asset CRUD ───────────────────────────────────────────────────

export function getAllAssets(): Asset[] {
  const database = getDb();
  const rows = database.getAllSync(
    "SELECT * FROM assets ORDER BY created_at DESC"
  ) as Record<string, unknown>[];
  return rows.map(rowToAsset);
}

export function getAssetById(id: string): Asset | null {
  const database = getDb();
  const row = database.getFirstSync(
    "SELECT * FROM assets WHERE id = ?",
    [id]
  ) as Record<string, unknown> | null;
  return row ? rowToAsset(row) : null;
}

export function insertAsset(input: AssetInput): Asset {
  const database = getDb();
  const id  = generateId();
  const now = Date.now();

  database.runSync(
    `INSERT INTO assets
      (id, name, type, quantity, buy_price, current_price, currency, notes, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.name,
      input.type,
      input.quantity,
      input.buyPrice,
      input.currentPrice,
      input.currency,
      input.notes ?? null,
      now,
      now,
    ]
  );

  return { ...input, id, createdAt: now, updatedAt: now };
}

export function updateAsset(id: string, updates: Partial<AssetInput>): void {
  const database = getDb();
  const now      = Date.now();

  const fields: string[] = [];
  const values: unknown[] = [];

  if (updates.name         !== undefined) { fields.push("name = ?");          values.push(updates.name); }
  if (updates.type         !== undefined) { fields.push("type = ?");          values.push(updates.type); }
  if (updates.quantity     !== undefined) { fields.push("quantity = ?");      values.push(updates.quantity); }
  if (updates.buyPrice     !== undefined) { fields.push("buy_price = ?");     values.push(updates.buyPrice); }
  if (updates.currentPrice !== undefined) { fields.push("current_price = ?"); values.push(updates.currentPrice); }
  if (updates.notes        !== undefined) { fields.push("notes = ?");         values.push(updates.notes); }

  if (fields.length === 0) return;

  fields.push("updated_at = ?");
  values.push(now);
  values.push(id);

  database.runSync(
    `UPDATE assets SET ${fields.join(", ")} WHERE id = ?`,
    values as SQLite.SQLiteBindValue[]
  );
}

export function deleteAsset(id: string): void {
  const database = getDb();
  database.runSync("DELETE FROM assets WHERE id = ?", [id]);
}

export function getAssetCount(): number {
  const database = getDb();
  const row = database.getFirstSync(
    "SELECT COUNT(*) as count FROM assets"
  ) as { count: number };
  return row.count;
}

// ─── Snapshot functions ───────────────────────────────────────────

export function saveSnapshot(
  totalValue: number,
  breakdown: Record<string, number>
): void {
  const database = getDb();
  database.runSync(
    "INSERT INTO snapshots (id, total_value, asset_breakdown, captured_at) VALUES (?, ?, ?, ?)",
    [generateId(), totalValue, JSON.stringify(breakdown), Date.now()]
  );
}

export function getSnapshots(limit: number = 12): Snapshot[] {
  const database = getDb();
  const rows = database.getAllSync(
    "SELECT * FROM snapshots ORDER BY captured_at DESC LIMIT ?",
    [limit]
  ) as Record<string, unknown>[];

  return rows.map((r) => ({
    id:             r.id as string,
    totalValue:     r.total_value as number,
    assetBreakdown: JSON.parse(r.asset_breakdown as string),
    capturedAt:     r.captured_at as number,
  }));
}

// ─── Settings helpers ──────────────────────────────────────────────

export function getSetting(key: string): string | null {
  const database = getDb();
  const row = database.getFirstSync(
    "SELECT value FROM settings WHERE key = ?",
    [key]
  ) as { value: string } | null;
  return row?.value ?? null;
}

export function setSetting(key: string, value: string): void {
  const database = getDb();
  database.runSync(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [key, value]
  );
}

// ─── Delete everything (for "Delete all data" in Settings) ────────

export function deleteAllData(): void {
  const database = getDb();
  database.execSync("DELETE FROM assets; DELETE FROM snapshots; DELETE FROM settings;");
}

// ─── CSV export ────────────────────────────────────────────────────

export function exportToCSV(): string {
  const assets = getAllAssets();
  const header = "Name,Type,Quantity,Buy Price,Current Price,Current Value,Currency,Notes";
  const rows   = assets.map((a) => {
    const val = (a.quantity * a.currentPrice).toFixed(2);
    return [
      `"${a.name}"`,
      a.type,
      a.quantity,
      a.buyPrice,
      a.currentPrice,
      val,
      a.currency,
      `"${a.notes ?? ""}"`,
    ].join(",");
  });
  return [header, ...rows].join("\n");
}