const router = require('express').Router();
const multer = require('multer');
const Image = require('../models/Image');
const auth = require('../middleware/auth');
const { HttpError, asyncHandler } = require('../utils/errors');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) =>
    /^image\/(jpe?g|png|webp|gif)$/i.test(file.mimetype)
      ? cb(null, true)
      : cb(new HttpError(400, 'Solo se permiten imágenes JPG, PNG, WEBP o GIF')),
});

// Subir foto desde la galería
router.post(
  '/',
  auth,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!req.file) throw new HttpError(400, 'No se recibió ninguna imagen');
    const img = await Image.create({
      owner: req.userId,
      data: req.file.buffer,
      contentType: req.file.mimetype,
    });
    res.status(201).json({ url: `/api/images/${img._id}` });
  })
);

// Subir foto desde la app en formato JSON (base64): más fiable que multipart en React Native
router.post(
  '/base64',
  auth,
  asyncHandler(async (req, res) => {
    const { data, contentType } = req.body || {};
    if (typeof data !== 'string' || !data) throw new HttpError(400, 'No se recibió ninguna imagen');
    const buffer = Buffer.from(data.replace(/^data:[^;]+;base64,/, ''), 'base64');
    if (!buffer.length) throw new HttpError(400, 'La imagen está vacía');
    if (buffer.length > 5 * 1024 * 1024) throw new HttpError(413, 'La imagen supera los 5 MB');
    const type = /^image\/(jpe?g|png|webp|gif)$/i.test(contentType || '') ? contentType : 'image/jpeg';
    const img = await Image.create({ owner: req.userId, data: buffer, contentType: type });
    res.status(201).json({ url: `/api/images/${img._id}` });
  })
);

// Ver la foto (pública para que <Image> pueda cargarla sin cabeceras)
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const img = await Image.findById(req.params.id);
    if (!img) throw new HttpError(404, 'Imagen no encontrada');
    res.set('Content-Type', img.contentType);
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
    res.send(img.data);
  })
);

module.exports = router;
