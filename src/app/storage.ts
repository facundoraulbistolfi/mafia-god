import type { AppState } from './state';
import { hasMeaningfulSetup } from './state';

const STORAGE_KEY = 'mafia-god:state';
const STORAGE_VERSION = 3;

interface PersistedState {
  version: number;
  state: AppState;
}

export function loadSavedState() {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PersistedState;
    if (parsed.version !== STORAGE_VERSION || !parsed.state?.phase) {
      return null;
    }

    return parsed.state;
  } catch {
    return null;
  }
}

export function saveState(state: AppState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      version: STORAGE_VERSION,
      state,
    } satisfies PersistedState),
  );
}

export function clearSavedState() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

const PLAYERS_KEY = 'mafia-god:saved-players';

export function savePlayers(names: string[]): void {
  if (typeof window === 'undefined') return;
  const cleaned = names.map((n) => n.trim()).filter(Boolean);
  if (cleaned.length === 0) {
    window.localStorage.removeItem(PLAYERS_KEY);
    return;
  }
  window.localStorage.setItem(PLAYERS_KEY, JSON.stringify(cleaned));
}

export function loadSavedPlayers(): string[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(PLAYERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v: unknown) => typeof v === 'string' && (v as string).trim().length > 0);
  } catch {
    return [];
  }
}

export function clearSavedPlayers(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PLAYERS_KEY);
}

export function shouldPersistState(state: AppState) {
  if (state.phase !== 'setup') {
    return true;
  }

  return hasMeaningfulSetup(state.setup);
}
