const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Group = require('../models/Group');
const Image = require('../models/Image');
const auth = require('../middleware/auth');
const { HttpError, asyncHandler } = require('../utils/errors');
const { validateUsername, validateEmail, validatePassword } = require('../utils/validators');

const sign = (user) => jwt.sign({ id: String(user._id) }, process.env.JWT_SECRET, { expiresIn: '30d' });
const userDto = (u) => ({ id: String(u._id), username: u.username, email: u.email });

// Registro
router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { username = '', email = '', password = '' } = req.body || {};
    const err = validateUsername(username) || validateEmail(email) || validatePassword(password);
    if (err) throw new HttpError(400, err);
    const user = await User.create({
      username,
      usernameLower: username.toLowerCase(),
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
    });
    res.status(201).json({ token: sign(user), user: userDto(user) });
  })
);

// Inicio de sesión
router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { username = '', password = '' } = req.body || {};
    const user = await User.findOne({ usernameLower: String(username).trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(String(password), user.passwordHash)))
      throw new HttpError(401, 'Credenciales incorrectas');
    res.json({ token: sign(user), user: userDto(user) });
  })
);

// Perfil del usuario con sesión
router.get(
  '/me',
  auth,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);
    if (!user) throw new HttpError(401, 'La cuenta ya no existe');
    res.json(userDto(user));
  })
);

// Editar perfil
router.put(
  '/me',
  auth,
  asyncHandler(async (req, res) => {
    const { username = '', email = '', password } = req.body || {};
    const err = validateUsername(username) || validateEmail(email) || (password ? validatePassword(password) : null);
    if (err) throw new HttpError(400, err);
    const user = await User.findById(req.userId);
    if (!user) throw new HttpError(401, 'La cuenta ya no existe');
    user.username = username;
    user.usernameLower = username.toLowerCase();
    user.email = email.toLowerCase();
    if (password) user.passwordHash = await bcrypt.hash(password, 10);
    await user.save();
    res.json(userDto(user));
  })
);

// Borrar cuenta (y todo lo que le pertenece)
router.delete(
  '/me',
  auth,
  asyncHandler(async (req, res) => {
    await Recipe.deleteMany({ owner: req.userId });
    await Group.deleteMany({ owner: req.userId });
    await Image.deleteMany({ owner: req.userId });
    await User.findByIdAndDelete(req.userId);
    res.json({ ok: true });
  })
);

module.exports = router;
