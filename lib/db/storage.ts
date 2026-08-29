import fs from "fs";
import path from "path";

const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? "/tmp" : path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const BUNDLED_DB_FILE = path.join(process.cwd(), "data", "db.json");

let inMemoryCache: any = null;

export function loadDataFromFile<T>(fallbackData: T): T {
  if (inMemoryCache) {
    return inMemoryCache as T;
  }

  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      inMemoryCache = JSON.parse(content) as T;
      return inMemoryCache;
    }
    if (fs.existsSync(BUNDLED_DB_FILE)) {
      const content = fs.readFileSync(BUNDLED_DB_FILE, "utf-8");
      inMemoryCache = JSON.parse(content) as T;
      return inMemoryCache;
    }
    inMemoryCache = fallbackData;
    saveDataToFile(fallbackData);
    return fallbackData;
  } catch (error) {
    console.error("Error reading db.json, using fallback:", error);
    return inMemoryCache || fallbackData;
  }
}

export function saveDataToFile<T>(data: T): void {
  inMemoryCache = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.warn("Could not write to filesystem (expected in some serverless environments):", error);
  }
}

