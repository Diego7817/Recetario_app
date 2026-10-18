export const validateUsername = (u) => {
  if (!u) return 'El usuario es obligatorio';
  if (u.length < 4 || u.length > 20) return 'El usuario debe tener entre 4 y 20 caracteres';
  if (!/^[a-zA-Z0-9_]+$/.test(u)) return 'El usuario solo puede tener letras, números y guion bajo';
  return null;
};

export const validateEmail = (e) => {
  if (!e) return 'El correo es obligatorio';
  if (e.length > 50) return 'El correo admite máximo 50 caracteres';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return 'Correo no válido';
  return null;
};

export const validatePassword = (p) => {
  if (!p) return 'La contraseña es obligatoria';
  if (p.length < 8 || p.length > 32) return 'La contraseña debe tener entre 8 y 32 caracteres';
  if (/\s/.test(p)) return 'La contraseña no puede contener espacios';
  if (!/[A-Z]/.test(p)) return 'La contraseña necesita una mayúscula';
  if (!/[a-z]/.test(p)) return 'La contraseña necesita una minúscula';
  if (!/[0-9]/.test(p)) return 'La contraseña necesita un número';
  if (!/[^A-Za-z0-9]/.test(p)) return 'La contraseña necesita un carácter especial';
  return null;
};
