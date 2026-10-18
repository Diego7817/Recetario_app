import { api, getToken, setToken } from './api';
import { validateUsername, validateEmail, validatePassword } from './validators';

export async function register({ username, email, password }) {
  const err = validateUsername(username) || validateEmail(email) || validatePassword(password);
  if (err) throw new Error(err);
  const res = await api('/api/auth/register', { method: 'POST', body: { username, email, password }, auth: false });
  await setToken(res.token);
  return res.user;
}

export async function login(username, password) {
  const res = await api('/api/auth/login', {
    method: 'POST',
    body: { username: username.trim(), password },
    auth: false,
  });
  await setToken(res.token);
  return res.user;
}

export const logout = () => setToken(null);

export async function getSessionUser() {
  if (!(await getToken())) return null;
  try {
    return await api('/api/auth/me');
  } catch (e) {
    return null;
  }
}

export async function updateProfile(_id, { username, email, password }) {
  const err =
    validateUsername(username) || validateEmail(email) || (password ? validatePassword(password) : null);
  if (err) throw new Error(err);
  return api('/api/auth/me', { method: 'PUT', body: { username, email, password: password || undefined } });
}

export async function deleteAccount() {
  await api('/api/auth/me', { method: 'DELETE' });
  await setToken(null);
}
