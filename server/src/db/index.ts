import fs from 'fs';
import path from 'path';

const DB_DIR = path.resolve(process.cwd(), 'src', 'db');

const ensureDbDir = () => {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
};

export function readDb<T>(name: string): T {
  ensureDbDir();
  const filePath = path.join(DB_DIR, `${name}.json`);
  if (!fs.existsSync(filePath)) return [] as unknown as T;
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data || 'null') ?? ([] as unknown as T);
  } catch {
    return [] as unknown as T;
  }
}

export function writeDb<T>(name: string, data: T): void {
  ensureDbDir();
  const filePath = path.join(DB_DIR, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}
