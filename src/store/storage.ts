import AsyncStorage from '@react-native-async-storage/async-storage';

const isWeb = typeof window !== 'undefined';

const webStorage = {
  getItem: (name: string) => {
    const value = localStorage.getItem(name);
    return Promise.resolve(value);
  },
  setItem: (name: string, value: string) => {
    localStorage.setItem(name, value);
    return Promise.resolve();
  },
  removeItem: (name: string) => {
    localStorage.removeItem(name);
    return Promise.resolve();
  },
};

export const safeStorage = isWeb ? webStorage : AsyncStorage;
