import express from 'express'
import {GetCommerce, GetCreate, GetDelete, GetIndex, GetEdit,
        PostCreate, PostDelete, PostEdit} from '../controllers/CommerceController.js'
import isAuthForCommerce from '../middlewares/isAuthForCommerce.js';

const router = express.Router();

//Auth Routes
router.get('/home', isAuthForCommerce,GetCommerce);

// Listado de categorías
router.get("/categorias", isAuthForCommerce, GetIndex);

// Crear categoría
router.get("/create", isAuthForCommerce, GetCreate);
router.post("/create", isAuthForCommerce, PostCreate);

// Editar categoría
router.get("/edit/:categoriasId", isAuthForCommerce, GetEdit);
router.post("/edit", isAuthForCommerce, PostEdit);

// Eliminar categoría
router.get("/delete/:categoriasId", isAuthForCommerce, GetDelete);
router.post("/delete", isAuthForCommerce, PostDelete);

export default router;