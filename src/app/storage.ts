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

export function shouldPersistState(state: AppState) {
  if (state.phase !== 'setup') {
    return true;
  }

  return hasMeaningfulSetup(state.setup);
}
