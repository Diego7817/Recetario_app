require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');

const { MONGODB_URI, JWT_SECRET } = process.env;
const PORT = process.env.PORT || 3000;

if (!MONGODB_URI || !JWT_SECRET) {
  console.error('Faltan variables en .env: MONGODB_URI y JWT_SECRET (copia .env.example a .env)');
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    // Asegura los índices únicos (usuario, correo, título de receta por usuario, nombre de grupo por usuario)
    await Promise.all(Object.values(mongoose.models).map((m) => m.init()));
    console.log('MongoDB conectado');
    app.listen(PORT, '0.0.0.0', () => console.log(`API lista en http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error('No se pudo conectar a MongoDB:', err.message);
    console.error('Detalle:', err.reason || err);
    process.exit(1);
  });
