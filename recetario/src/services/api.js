import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const TOKEN_KEY = 'token';

export const getToken = () => AsyncStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? AsyncStorage.setItem(TOKEN_KEY, t) : AsyncStorage.removeItem(TOKEN_KEY));

// Las fotos subidas al servidor vienen como "/api/images/..."; las de internet como "https://..."
export const resolveImage = (uri) => (uri && uri.startsWith('/') ? `${API_URL}${uri}` : uri);

export async function api(path, { method = 'GET', body, auth = true, formData } = {}) {
  const headers = {};
  headers['ngrok-skip-browser-warning'] = 'true';
  if (!formData) headers['Content-Type'] = 'application/json';
  if (auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000); // el hosting gratuito puede tardar en despertar
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: formData || (body ? JSON.stringify(body) : undefined),
      signal: controller.signal,
    });
  } catch (e) {
    throw new Error('No se pudo conectar con el servidor. Revisa tu conexión.');
  } finally {
    clearTimeout(timer);
  }

  let data = null;
  try {
    data = await res.json();
  } catch (e) {}

  if (!res.ok) {
    if (res.status === 401 && auth) await setToken(null);
    throw new Error((data && data.message) || 'Error del servidor');
  }
  return data;
}
