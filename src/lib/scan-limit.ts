const STORAGE_KEY = 'tsukaremiru_scans';
const FREE_LIMIT = 9999; // unlimited until we have users
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

interface ScanLog {
  timestamps: number[];
}

function getLog(): ScanLog {
  if (typeof window === 'undefined') return { timestamps: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { timestamps: [] };
    return JSON.parse(raw);
  } catch {
    return { timestamps: [] };
  }
}

function saveLog(log: ScanLog) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

export function getScansThisWeek(): number {
  const log = getLog();
  const weekAgo = Date.now() - WEEK_MS;
  return log.timestamps.filter(t => t > weekAgo).length;
}

export function canScan(): boolean {
  return getScansThisWeek() < FREE_LIMIT;
}

export function recordScan() {
  const log = getLog();
  log.timestamps.push(Date.now());
  // Keep only last 4 weeks
  const fourWeeksAgo = Date.now() - WEEK_MS * 4;
  log.timestamps = log.timestamps.filter(t => t > fourWeeksAgo);
  saveLog(log);
}

export function getRemainingScans(): number {
  return Math.max(0, FREE_LIMIT - getScansThisWeek());
}
