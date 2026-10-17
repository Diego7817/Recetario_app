const express = require('express');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
// Las imágenes necesitan un límite mayor; se monta antes del parser general
app.use('/api/images', express.json({ limit: '10mb' }), require('./routes/images'));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/recipes', require('./routes/recipes'));
app.use('/api/groups', require('./routes/groups'));

app.use((req, res) => res.status(404).json({ message: 'Ruta no encontrada' }));
app.use(errorHandler);

module.exports = app;
