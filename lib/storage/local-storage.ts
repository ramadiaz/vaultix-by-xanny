const isBrowser = typeof window !== "undefined";

export function readLocalStorage<T>(key: string, fallback: T): T {
  if (!isBrowser) {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);

    if (!rawValue) {
      return fallback;
    }

    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

export function writeLocalStorage<T>(key: string, value: T) {
  if (!isBrowser) {
    return;
  }

  try {
    const rawValue = JSON.stringify(value);
    window.localStorage.setItem(key, rawValue);
  } catch {
    return;
  }
}

