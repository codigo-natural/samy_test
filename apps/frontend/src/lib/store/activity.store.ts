import { create } from 'zustand';

export interface ActivityEvent {
  type: string;
  message: string;
  timestamp: string;
}

interface ActivityState {
  events: ActivityEvent[];
  addEvent: (event: Omit<ActivityEvent, 'timestamp'>) => void;
}

const STORAGE_KEY = 'activity_events_v1';

function loadInitial(): ActivityEvent[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ActivityEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  events: [],
  addEvent: (event) => {
    const next: ActivityEvent[] = [
      {
        ...event,
        timestamp: new Date().toISOString(),
      },
      ...get().events,
    ].slice(0, 10);

    set({ events: next });

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  },
}));

if (typeof window !== 'undefined') {
  useActivityStore.setState({ events: loadInitial() });
}
