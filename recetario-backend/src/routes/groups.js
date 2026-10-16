const router = require('express').Router();
const Group = require('../models/Group');
const Recipe = require('../models/Recipe');
const auth = require('../middleware/auth');
const { HttpError, asyncHandler } = require('../utils/errors');

router.use(auth);

const COLLATION = { locale: 'es', strength: 1 };
const dto = (g) => ({
  id: String(g._id),
  ownerId: String(g.owner),
  name: g.name,
  description: g.description,
});

function parseGroup(body) {
  const name = String((body && body.name) || '').trim();
  if (!name) throw new HttpError(400, 'El nombre es obligatorio');
  if (name.length > 40) throw new HttpError(400, 'Nombre: máximo 40 caracteres');
  return {
    name,
    nameLower: name.toLowerCase(),
    description: String((body && body.description) || '').trim().slice(0, 200),
  };
}

async function ownGroup(req) {
  const group = await Group.findById(req.params.id);
  if (!group) throw new HttpError(404, 'Grupo no encontrado');
  if (String(group.owner) !== String(req.userId)) throw new HttpError(403, 'Ese grupo no es tuyo');
  return group;
}

// Mis grupos, ordenados alfabéticamente
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const groups = await Group.find({ owner: req.userId }).collation(COLLATION).sort({ name: 1 });
    res.json(groups.map(dto));
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    res.json(dto(await ownGroup(req)));
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const group = await Group.create({ ...parseGroup(req.body), owner: req.userId });
    res.status(201).json(dto(group));
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const group = await ownGroup(req);
    group.set(parseGroup(req.body));
    await group.save();
    res.json(dto(group));
  })
);

// Borrar un grupo borra también las recetas que pertenecen a él
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const group = await ownGroup(req);
    const result = await Recipe.deleteMany({ owner: req.userId, groups: group._id });
    await group.deleteOne();
    res.json({ ok: true, deletedRecipes: result.deletedCount });
  })
);

module.exports = router;
