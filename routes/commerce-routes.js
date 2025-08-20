import express from 'express'
import {GetCommerce, GetCreateCategory, GetDeleteCategory, GetCategory, GetEditCategory,
        PostCreateCategory, PostDeleteCategory, PostEditCategory, PostCreateProduct, 
        PostDeleteProduct, PostEditProduct, GetCreateProduct, GetDeleteProduct, 
        GetEditProduct, GetProducts, GetCommerceHome, GetOrderDetail, PostAssignDelivery} 
        from '../controllers/CommerceController.js';
import isAuthForCommerce from '../middlewares/isAuthForCommerce.js';

const router = express.Router();

router.get('/home', isAuthForCommerce,GetCommerce);


// Home del comercio
router.get('/home', isAuthForCommerce, GetCommerceHome);

// Detalle de pedido
router.get('/orders/:orderId', isAuthForCommerce, GetOrderDetail);

// Asignar delivery (form submit)
router.post('/orders/assign-delivery', isAuthForCommerce, PostAssignDelivery);

//Mantenimiento Categoria Routes
router.get("/categorias", isAuthForCommerce, GetCategory);
router.get("/create", isAuthForCommerce, GetCreateCategory);
router.post("/create", isAuthForCommerce, PostCreateCategory);
router.get("/edit/:categoriasId", isAuthForCommerce, GetEditCategory);
router.post("/edit", isAuthForCommerce, PostEditCategory);
router.get("/delete/:categoriasId", isAuthForCommerce, GetDeleteCategory);
router.post("/delete", isAuthForCommerce, PostDeleteCategory);

//Mantenimiento productos routes
router.get("/productos", isAuthForCommerce, GetProducts);
router.get("/productos/create", isAuthForCommerce, GetCreateProduct);
router.post("/productos/create", isAuthForCommerce, PostCreateProduct);
router.get("/productos/edit/:productId", isAuthForCommerce, GetEditProduct);
router.post("/productos/edit", isAuthForCommerce, PostEditProduct);
router.get("/productos/delete/:productId", isAuthForCommerce, GetDeleteProduct);
router.post("/productos/delete", isAuthForCommerce, PostDeleteProduct);

export default router;