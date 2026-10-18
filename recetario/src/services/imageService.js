import { api } from './api';

// Sube la foto elegida de la galería (en base64, por JSON) y devuelve su ruta "/api/images/..."
export async function uploadImage(asset) {
  if (!asset || !asset.base64) throw new Error('No se pudo leer la imagen');
  const { url } = await api('/api/images/base64', {
    method: 'POST',
    body: { data: asset.base64, contentType: asset.mimeType || 'image/jpeg' },
  });
  return url;
}
