import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const USER_ID_KEY = '@user_id';

const getStorage = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return {
      getItem: async (key) => localStorage.getItem(key),
      setItem: async (key, value) => localStorage.setItem(key, value)
    };
  } else {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage;
  }
};

export const getUserId = async () => {
  try {
    const storage = getStorage();
    let userId = await storage.getItem(USER_ID_KEY);
    if (!userId) {
      userId = uuidv4();
      await storage.setItem(USER_ID_KEY, userId);
    }
    return userId;
  } catch (error) {
    console.error('Failed to get user ID:', error);
    return uuidv4();
  }
};
