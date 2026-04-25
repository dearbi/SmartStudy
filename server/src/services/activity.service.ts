import fs from 'fs';
import path from 'path';

const ACTIVITY_FILE = path.join(__dirname, '../db/activity.json');

// Interface for Activity Data Structure
// Structure: { [userId: string]: { [date: string]: number } }
interface ActivityData {
  [userId: string]: {
    [date: string]: number;
  };
}

// Helper to ensure DB directory exists
const ensureDbDir = () => {
    const dir = path.dirname(ACTIVITY_FILE);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
};

const readActivityData = (): ActivityData => {
  ensureDbDir();
  if (!fs.existsSync(ACTIVITY_FILE)) {
    return {};
  }
  try {
    const data = fs.readFileSync(ACTIVITY_FILE, 'utf-8');
    return JSON.parse(data || '{}');
  } catch (error) {
    console.error("Error reading activity data:", error);
    return {};
  }
};

const writeActivityData = (data: ActivityData) => {
  ensureDbDir();
  fs.writeFileSync(ACTIVITY_FILE, JSON.stringify(data, null, 2));
};

export const logActivity = (userId: string, points: number) => {
  const data = readActivityData();
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  if (!data[userId]) {
    data[userId] = {};
  }

  if (!data[userId][today]) {
    data[userId][today] = 0;
  }

  // Add points (can be float, e.g. 0.016 for 1 min learning)
  data[userId][today] += points;
  
  // Round to 2 decimal places to avoid float precision issues
  data[userId][today] = Math.round(data[userId][today] * 100) / 100;

  writeActivityData(data);
  console.log(`[Activity] User ${userId} gained ${points} points. Total today: ${data[userId][today]}`);
};

export const getActivityData = (userId: string, startDate?: Date, endDate?: Date): { date: string; count: number }[] => {
  const data = readActivityData();
  const userActivity = data[userId] || {};
  
  // Convert object to array
  const result = Object.entries(userActivity).map(([date, count]) => ({
    date,
    count: Math.floor(count) // Heatmap usually expects integers, floor it to be safe
  }));

  // Filter by date range if provided
  if (startDate && endDate) {
      return result.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= startDate && itemDate <= endDate;
      });
  }

  return result;
};
