import AsyncStorage from '@react-native-async-storage/async-storage';

export const KEYS = { users: 'users', recipes: 'recipes', groups: 'groups', session: 'session' };

export const load = async (key) => {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : [];
};

export const save = (key, data) => AsyncStorage.setItem(key, JSON.stringify(data));
