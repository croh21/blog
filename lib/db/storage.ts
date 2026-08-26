import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

export function loadDataFromFile<T>(fallbackData: T): T {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      return JSON.parse(content) as T;
    } else {
      saveDataToFile(fallbackData);
      return fallbackData;
    }
  } catch (error) {
    console.error("Error reading db.json, using fallback:", error);
    return fallbackData;
  }
}

export function saveDataToFile<T>(data: T): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Error saving data to db.json:", error);
  }
}
