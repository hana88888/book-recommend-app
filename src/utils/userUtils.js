import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const USER_ID_KEY = '@user_id';

export const getUserId = async () => {
  try {
    let userId = await AsyncStorage.getItem(USER_ID_KEY);
    if (!userId) {
      userId = uuidv4();
      await AsyncStorage.setItem(USER_ID_KEY, userId);
    }
    return userId;
  } catch (error) {
    console.error('Failed to get user ID:', error);
    return uuidv4(); // fallback to temporary ID
  }
};
