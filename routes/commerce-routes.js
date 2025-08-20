import express from 'express'
import {GetCommerce, GetCreate, GetDelete, GetIndex, GetEdit,
        PostCreate, PostDelete, PostEdit, PostCreateProduct, 
        PostDeleteProduct, PostEditProduct, GetCreateProduct, GetDeleteProduct, 
        GetEditProduct, GetProducts, GetCommerceHome, GetOrderDetail, PostAssignDelivery} 
        from '../controllers/CommerceController.js';
import isAuthForCommerce from '../middlewares/isAuthForCommerce.js';

const router = express.Router();

// router.get('/home', isAuthForCommerce,GetCommerce);

// Home del comercio 
router.get('/home', isAuthForCommerce, GetCommerceHome);

// Detalle de pedido
router.get('/orders/:orderId', isAuthForCommerce, GetOrderDetail);

// Asignar delivery (form submit)
router.post('/orders/assign-delivery', isAuthForCommerce, PostAssignDelivery);


//Mantenimiento Categoria Routes
router.get("/categorias", isAuthForCommerce, GetIndex);
router.get("/create", isAuthForCommerce, GetCreate);
router.post("/create", isAuthForCommerce, PostCreate);
router.get("/edit/:categoriasId", isAuthForCommerce, GetEdit);
router.post("/edit", isAuthForCommerce, PostEdit);
router.get("/delete/:categoriasId", isAuthForCommerce, GetDelete);
router.post("/delete", isAuthForCommerce, PostDelete);

//Mantenimiento productos routes
router.get("/productos", isAuthForCommerce, GetProducts);
router.get("/productos/create", isAuthForCommerce, GetCreateProduct);
router.post("/productos/create", isAuthForCommerce, PostCreateProduct);
router.get("/productos/edit/:productId", isAuthForCommerce, GetEditProduct);
router.post("/productos/edit", isAuthForCommerce, PostEditProduct);
router.get("/productos/delete/:productId", isAuthForCommerce, GetDeleteProduct);
router.post("/productos/delete", isAuthForCommerce, PostDeleteProduct);

export default router;