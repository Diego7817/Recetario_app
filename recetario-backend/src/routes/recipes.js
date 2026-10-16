const router = require('express').Router();
const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const Group = require('../models/Group');
const auth = require('../middleware/auth');
const { HttpError, asyncHandler } = require('../utils/errors');

router.use(auth);

const COLLATION = { locale: 'es', strength: 1 }; // orden alfabético sin distinguir mayúsculas/acentos

function serialize(r) {
  const populated = r.owner && r.owner._id;
  return {
    id: String(r._id),
    ownerId: String(populated ? r.owner._id : r.owner),
    ownerName: populated ? r.owner.username : undefined,
    title: r.title,
    description: r.description,
    image: r.image,
    prepTime: r.prepTime,
    servings: r.servings,
    ingredients: r.ingredients.map((i) => ({ name: i.name, quantity: i.quantity })),
    steps: r.steps,
    groupIds: (r.groups || []).map(String),
    copiedFrom: r.copiedFrom ? String(r.copiedFrom) : null,
  };
}

const digits = (v) => String(v || '').replace(/\D/g, '').slice(0, 4);

async function parseRecipe(body = {}, userId) {
  const title = String(body.title || '').trim();
  if (!title) throw new HttpError(400, 'El título es obligatorio');
  if (title.length > 60) throw new HttpError(400, 'Título: máximo 60 caracteres');

  const ingredients = (Array.isArray(body.ingredients) ? body.ingredients : [])
    .map((i) => ({
      name: String((i && i.name) || '').trim().slice(0, 40),
      quantity: String((i && i.quantity) || '').trim().slice(0, 15),
    }))
    .filter((i) => i.name);
  if (!ingredients.length) throw new HttpError(400, 'Agrega al menos un ingrediente');

  const steps = (Array.isArray(body.steps) ? body.steps : [])
    .map((s) => String(s || '').trim().slice(0, 300))
    .filter(Boolean);
  if (!steps.length) throw new HttpError(400, 'Agrega al menos un paso');

  const image = String(body.image || '').trim();
  if (image && !/^https?:\/\/\S+$/i.test(image) && !/^\/api\/images\/[a-f0-9]{24}$/i.test(image))
    throw new HttpError(400, 'La imagen no es válida');

  let groups;
  if (Array.isArray(body.groupIds)) {
    // Solo se aceptan grupos que pertenezcan al usuario
    groups = await Group.distinct('_id', {
      _id: { $in: body.groupIds.filter((g) => mongoose.isValidObjectId(g)) },
      owner: userId,
    });
  }

  return {
    title,
    titleLower: title.toLowerCase(),
    description: String(body.description || '').trim().slice(0, 300),
    image,
    prepTime: digits(body.prepTime),
    servings: digits(body.servings),
    ingredients,
    steps,
    groups,
  };
}

async function ownRecipe(req) {
  const recipe = await Recipe.findById(req.params.id);
  if (!recipe) throw new HttpError(404, 'Receta no encontrada');
  if (String(recipe.owner) !== String(req.userId))
    throw new HttpError(403, 'Esta receta es de otro usuario');
  return recipe;
}

// Listado: ?scope=mine (personales) | all (generales). Siempre en orden alfabético.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const filter = req.query.scope === 'mine' ? { owner: req.userId } : {};
    if (req.query.q) {
      const safe = String(req.query.q).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.titleLower = new RegExp(safe);
    }
    const recipes = await Recipe.find(filter)
      .populate('owner', 'username')
      .collation(COLLATION)
      .sort({ title: 1 });
    res.json(recipes.map(serialize));
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const recipe = await Recipe.findById(req.params.id).populate('owner', 'username');
    if (!recipe) throw new HttpError(404, 'Receta no encontrada');
    res.json(serialize(recipe));
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = await parseRecipe(req.body, req.userId);
    const recipe = await Recipe.create({ ...data, groups: data.groups || [], owner: req.userId });
    await recipe.populate('owner', 'username');
    res.status(201).json(serialize(recipe));
  })
);

router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const recipe = await ownRecipe(req);
    const data = await parseRecipe(req.body, req.userId);
    if (data.groups === undefined) delete data.groups;
    recipe.set(data);
    await recipe.save();
    await recipe.populate('owner', 'username');
    res.json(serialize(recipe));
  })
);

router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const recipe = await ownRecipe(req);
    await recipe.deleteOne();
    res.json({ ok: true });
  })
);

// Copiar la receta de otro usuario a mis recetas
router.post(
  '/:id/copy',
  asyncHandler(async (req, res) => {
    const src = await Recipe.findById(req.params.id);
    if (!src) throw new HttpError(404, 'Receta no encontrada');
    let title = src.title;
    let n = 1;
    while (await Recipe.exists({ owner: req.userId, titleLower: title.toLowerCase() })) {
      title = `${src.title} (copia${n > 1 ? ' ' + n : ''})`.slice(0, 60);
      n++;
    }
    const copy = await Recipe.create({
      owner: req.userId,
      title,
      titleLower: title.toLowerCase(),
      description: src.description,
      image: src.image,
      prepTime: src.prepTime,
      servings: src.servings,
      ingredients: src.ingredients,
      steps: src.steps,
      groups: [],
      copiedFrom: src._id,
    });
    await copy.populate('owner', 'username');
    res.status(201).json(serialize(copy));
  })
);

// Agregar la receta a un grupo (una receta puede estar en varios grupos)
router.put(
  '/:id/groups/:groupId',
  asyncHandler(async (req, res) => {
    const recipe = await ownRecipe(req);
    const group = await Group.findOne({ _id: req.params.groupId, owner: req.userId });
    if (!group) throw new HttpError(404, 'Grupo no encontrado');
    await Recipe.updateOne({ _id: recipe._id }, { $addToSet: { groups: group._id } });
    res.json({ ok: true });
  })
);

// Quitar la receta de un grupo: la receta NO se borra, solo sale del grupo
router.delete(
  '/:id/groups/:groupId',
  asyncHandler(async (req, res) => {
    const recipe = await ownRecipe(req);
    await Recipe.updateOne({ _id: recipe._id }, { $pull: { groups: req.params.groupId } });
    res.json({ ok: true });
  })
);

module.exports = router;
