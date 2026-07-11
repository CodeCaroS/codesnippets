export const loadFromStorage = <T>(key: string, parse: (value: unknown) => T, fallback: T): T => {
  try {
    const value = window.localStorage.getItem(key);
    return value ? parse(JSON.parse(value)) : fallback;
  } catch {
    return fallback;
  }
};

export const saveToStorage = <T>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Browser privacy settings can deny local storage. Keep value in memory.
  }
};
