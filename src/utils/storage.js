const STORAGE_KEY = "family-tree-data-v1";

export function loadSavedTree() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveTree(tree) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tree));
  } catch {
    // storage full or unavailable — fail silently, autosave is best-effort
  }
}

export function clearSavedTree() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

const THEME_KEY = "family-tree-theme";

export function loadSavedTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}
