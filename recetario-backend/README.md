# Recetario - Backend (Node + Express + MongoDB)

## Puesta en marcha
1. `npm install`
2. Copia `.env.example` a `.env` y ajusta `MONGODB_URI` y `JWT_SECRET`.
3. `npm run dev`  (o `npm start`)
4. Comprueba: http://localhost:3000/api/health  ->  {"ok":true}

## Endpoints (todos con `Authorization: Bearer <token>` salvo los marcados)
Auth
- POST   /api/auth/register          (público) {username,email,password}
- POST   /api/auth/login             (público) {username,password}
- GET    /api/auth/me
- PUT    /api/auth/me                {username,email,password?}
- DELETE /api/auth/me                borra cuenta, recetas, grupos y fotos

Recetas
- GET    /api/recipes?scope=mine|all   orden alfabético
- GET    /api/recipes/:id
- POST   /api/recipes
- PUT    /api/recipes/:id
- DELETE /api/recipes/:id
- POST   /api/recipes/:id/copy         copia la receta de otro usuario
- PUT    /api/recipes/:id/groups/:groupId     agrega la receta a un grupo
- DELETE /api/recipes/:id/groups/:groupId     la quita del grupo (no la borra)

Grupos
- GET/POST /api/groups
- GET/PUT/DELETE /api/groups/:id   (DELETE borra también sus recetas y devuelve {deletedRecipes})

Imágenes
- POST /api/images  (multipart, campo "image", máx. 5 MB)  -> {url}
- GET  /api/images/:id   (público)
