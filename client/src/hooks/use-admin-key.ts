import { useSyncExternalStore, useCallback, useEffect } from "react";

const STORAGE_KEY = "admin_key";
const EVENT_NAME = "admin-key-change";

function readFromStorage(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function writeToStorage(key: string): void {
  try {
    if (key) {
      localStorage.setItem(STORAGE_KEY, key);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  } catch {}
  window.dispatchEvent(new CustomEvent(EVENT_NAME));
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(EVENT_NAME, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT_NAME, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useAdminKey(): [string, (key: string) => void, () => void] {
  const adminKey = useSyncExternalStore(subscribe, readFromStorage, () => "");

  useEffect(() => {
    // Admin key via URL parameter removed for security — keys in URLs are
    // exposed in browser history, referrer headers, and server access logs.
    // Use the login form or localStorage directly instead.
  }, []);

  const setAdminKey = useCallback((key: string) => {
    writeToStorage(key);
  }, []);

  const clearKey = useCallback(() => {
    writeToStorage("");
  }, []);

  return [adminKey, setAdminKey, clearKey];
}
