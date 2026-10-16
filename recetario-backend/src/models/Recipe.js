const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 40 },
    quantity: { type: String, trim: true, maxlength: 15, default: '' },
  },
  { _id: false }
);

const recipeSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 60 },
    titleLower: { type: String, required: true },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    image: { type: String, default: '' },
    prepTime: { type: String, default: '' },
    servings: { type: String, default: '' },
    ingredients: { type: [ingredientSchema], default: [] },
    steps: { type: [String], default: [] },
    groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
    copiedFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },
  },
  { timestamps: true }
);

// Un usuario no puede tener dos recetas con el mismo título
recipeSchema.index({ owner: 1, titleLower: 1 }, { unique: true });

module.exports = mongoose.model('Recipe', recipeSchema);
