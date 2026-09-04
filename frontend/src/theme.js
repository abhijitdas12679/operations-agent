import { useEffect, useState } from 'react';

const STORAGE_KEY = 'theme';

/**
 * Resolve the effective theme ('light' | 'dark'):
 *  - an explicit saved choice wins,
 *  - otherwise fall back to the OS prefers-color-scheme,
 *  - otherwise light.
 */
function resolveTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved;
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
  } catch {
    /* localStorage unavailable */
  }
  return 'light';
}

/** Apply a theme to <html data-theme> and persist the manual choice. */
export function applyTheme(theme, { persist = true } = {}) {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme;
  }
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore write failure */
    }
  }
}

/**
 * useTheme — React hook for the dark-mode toggle.
 * Returns [theme, toggleTheme]. Keeps the DOM attr in sync on mount and
 * follows OS changes until the user toggles manually.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() =>
    typeof document !== 'undefined'
      ? document.documentElement.dataset.theme || resolveTheme()
      : 'light'
  );

  // Reflect state changes onto the DOM.
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // Follow system preference until the user makes a manual choice.
  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) return undefined; // user chose
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setTheme(e.matches ? 'dark' : 'light');
    mql.addEventListener?.('change', handler);
    return () => mql.removeEventListener?.('change', handler);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      applyTheme(next); // persist the manual choice
      return next;
    });
  };

  return [theme, toggleTheme];
}
