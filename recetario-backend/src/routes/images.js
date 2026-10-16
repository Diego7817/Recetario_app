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
