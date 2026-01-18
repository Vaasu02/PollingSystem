import { STORAGE_KEYS } from './constants';

export const storage = {
  get: (key: string): string | null => {
    return localStorage.getItem(key);
  },
  
  set: (key: string, value: string): void => {
    localStorage.setItem(key, value);
  },
  
  remove: (key: string): void => {
    localStorage.removeItem(key);
  },
  
  clear: (): void => {
    localStorage.clear();
  },
  
  getSessionId: (): string | null => {
    return storage.get(STORAGE_KEYS.SESSION_ID);
  },
  
  setSessionId: (sessionId: string): void => {
    storage.set(STORAGE_KEYS.SESSION_ID, sessionId);
  },
  
  getUserName: (): string | null => {
    return storage.get(STORAGE_KEYS.USER_NAME);
  },
  
  setUserName: (userName: string): void => {
    storage.set(STORAGE_KEYS.USER_NAME, userName);
  },
  
  getUserType: (): string | null => {
    return storage.get(STORAGE_KEYS.USER_TYPE);
  },
  
  setUserType: (userType: string): void => {
    storage.set(STORAGE_KEYS.USER_TYPE, userType);
  },
};

