import { useState, useEffect } from "react";

const STORAGE_KEY = "admin_key";

export function useAdminKey(): [string, (key: string) => void, () => void] {
  const getInitialKey = (): string => {
    const params = new URLSearchParams(window.location.search);
    const urlKey = params.get("key");
    if (urlKey) {
      try {
        localStorage.setItem(STORAGE_KEY, urlKey);
      } catch {}
      return urlKey;
    }
    try {
      return localStorage.getItem(STORAGE_KEY) ?? "";
    } catch {}
    return "";
  };

  const [adminKey, setAdminKeyState] = useState<string>(getInitialKey);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlKey = params.get("key");
    if (urlKey) {
      try {
        localStorage.setItem(STORAGE_KEY, urlKey);
      } catch {}
      setAdminKeyState(urlKey);
    }
  }, []);

  const setAdminKey = (key: string) => {
    try {
      localStorage.setItem(STORAGE_KEY, key);
    } catch {}
    setAdminKeyState(key);
  };

  const clearKey = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    setAdminKeyState("");
  };

  return [adminKey, setAdminKey, clearKey];
}
