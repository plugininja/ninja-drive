import { StorageKey } from "~/types/utility-types";

export const getFromLocalStorage = <T>(key: StorageKey): T | null => {
    const item = localStorage.getItem(key);

    if (!item) return null;

    return JSON.parse(item) as T;
};

export const saveToLocalStorage = <T>(key: StorageKey, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
};

export const removeFromLocalStorage = (key: StorageKey): void => {
    localStorage.removeItem(key);
};
