const STORAGE_KEY = 'ppl_tracker_data';

export const INITIAL_DATA = {
  setup: {
    done: false,
    name: '',
    restSeconds: 90
  },
  workouts: [],
  steps: {}
};

/**
 * Get current date string in local timezone YYYY-MM-DD
 */
export function getTodayDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format YYYY-MM-DD or Date into friendly string e.g. "Fri, 1 Aug"
 */
export function formatFriendlyDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
}

/**
 * Format numbers with Indian Number System (e.g. 5,000 or 1,50,000)
 */
export function formatIndianNumber(num) {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return Number(num).toLocaleString('en-IN');
}

/**
 * Load data safely from localStorage
 */
export function loadAppData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...INITIAL_DATA };
    const parsed = JSON.parse(raw);
    return {
      setup: { ...INITIAL_DATA.setup, ...(parsed.setup || {}) },
      workouts: Array.isArray(parsed.workouts) ? parsed.workouts : [],
      steps: parsed.steps && typeof parsed.steps === 'object' ? parsed.steps : {}
    };
  } catch (err) {
    console.error('Error reading localStorage, using initial data:', err);
    return { ...INITIAL_DATA };
  }
}

/**
 * Save data to localStorage
 */
export function saveAppData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Error saving to localStorage:', err);
  }
}

/**
 * Helper to calculate count of sessions with logged exercises
 */
export function getNonEmptySessionCount(workouts) {
  if (!Array.isArray(workouts)) return 0;
  return workouts.filter(w => Array.isArray(w.exercises) && w.exercises.length > 0).length;
}

/**
 * Rotation order
 */
export const PPL_ROTATION = ['push', 'pull', 'legs'];

/**
 * Suggest next day type based on last logged session
 */
export function getAutoSuggestedDayType(workouts) {
  if (!Array.isArray(workouts)) return 'push';
  // Filter for sessions that contain at least one exercise
  const loggedSessions = workouts.filter(w => Array.isArray(w.exercises) && w.exercises.length > 0);
  if (loggedSessions.length === 0) return 'push';
  // The last logged session is at the end (or we find highest index/latest date)
  const lastSession = loggedSessions[loggedSessions.length - 1];
  const lastType = (lastSession.dayType || 'push').toLowerCase();
  const currentIndex = PPL_ROTATION.indexOf(lastType);
  if (currentIndex === -1) return 'push';
  const nextIndex = (currentIndex + 1) % PPL_ROTATION.length;
  return PPL_ROTATION[nextIndex];
}
