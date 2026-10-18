import { api } from './api';

export const getGroups = () => api('/api/groups');

export async function getGroupById(id) {
  try {
    return await api(`/api/groups/${id}`);
  } catch (e) {
    return null;
  }
}

export const createGroup = (ownerId, data) => api('/api/groups', { method: 'POST', body: data });
export const updateGroup = (id, data) => api(`/api/groups/${id}`, { method: 'PUT', body: data });

// Borra el grupo y sus recetas. Devuelve cuántas recetas se borraron.
export async function deleteGroup(id) {
  const res = await api(`/api/groups/${id}`, { method: 'DELETE' });
  return res.deletedRecipes || 0;
}

export const addRecipeToGroup = (recipeId, groupId) =>
  api(`/api/recipes/${recipeId}/groups/${groupId}`, { method: 'PUT' });

// Quitar receta de un grupo: solo sale del grupo, no se borra
export const removeRecipeFromGroup = (recipeId, groupId) =>
  api(`/api/recipes/${recipeId}/groups/${groupId}`, { method: 'DELETE' });
