import { api } from './api';

export const getMine = () => api('/api/recipes?scope=mine');
export const getAll = () => api('/api/recipes?scope=all');

export async function getById(id) {
  try {
    return await api(`/api/recipes/${id}`);
  } catch (e) {
    return null;
  }
}

export const create = (ownerId, data) => api('/api/recipes', { method: 'POST', body: data });
export const update = (id, data) => api(`/api/recipes/${id}`, { method: 'PUT', body: data });
export const remove = (id) => api(`/api/recipes/${id}`, { method: 'DELETE' });
export const copyRecipe = (recipeId) => api(`/api/recipes/${recipeId}/copy`, { method: 'POST' });
