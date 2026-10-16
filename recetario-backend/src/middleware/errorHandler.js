module.exports = (err, req, res, next) => {
  if (err.code === 11000) {
    const keys = Object.keys(err.keyPattern || {});
    let message = 'Registro duplicado';
    if (keys.includes('usernameLower')) message = 'Ese usuario ya existe';
    else if (keys.includes('email')) message = 'Ese correo ya está registrado';
    else if (keys.includes('titleLower')) message = 'Ya tienes una receta con ese título';
    else if (keys.includes('nameLower')) message = 'Ya tienes un grupo con ese nombre';
    return res.status(409).json({ message });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: Object.values(err.errors)[0].message });
  }
  if (err.name === 'CastError') return res.status(400).json({ message: 'Identificador no válido' });
  if (err.name === 'MulterError') {
    return res.status(400).json({
      message: err.code === 'LIMIT_FILE_SIZE' ? 'La imagen supera los 5 MB' : err.message,
    });
  }
  const status = err.status || 500;
  if (status === 500) console.error(err);
  res.status(status).json({ message: status === 500 ? 'Error interno del servidor' : err.message });
};
