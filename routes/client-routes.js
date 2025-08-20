import { Router } from 'express';
import isAuthForClient from '../middlewares/isAuthForClient.js';
import ClientHomeController from '../controllers/client/HomeController.js';
import ClientCommercesController from '../controllers/client/CommercesController.js';
import ClientCartController from '../controllers/client/CartController.js';
import ClientCheckoutController from '../controllers/client/CheckoutController.js';
import ClientOrdersController from '../controllers/client/OrdersController.js';
import ClientAddressesController from '../controllers/client/AddressesController.js';
import ClientProfileController from '../controllers/client/ProfileController.js';
import ClientFavoritesController from '../controllers/client/FavoritesController.js';


// Diagnóstico rápido
console.log('[diag] typeof isAuthForClient =', typeof isAuthForClient);
console.log('[diag] HomeController.index =', typeof ClientHomeController?.index);
console.log('[diag] CommercesController.list =', typeof ClientCommercesController?.list);
console.log('[diag] CommercesController.catalog =', typeof ClientCommercesController?.catalog);
console.log('[diag] CartController.view =', typeof ClientCartController?.view);
console.log('[diag] CartController.add =', typeof ClientCartController?.add);
console.log('[diag] CartController.remove =', typeof ClientCartController?.remove);
console.log('[diag] CheckoutController.view =', typeof ClientCheckoutController?.view);
console.log('[diag] CheckoutController.placeOrder =', typeof ClientCheckoutController?.placeOrder);
console.log('[diag] OrdersController.list =', typeof ClientOrdersController?.list);
console.log('[diag] OrdersController.detail =', typeof ClientOrdersController?.detail);
console.log('[diag] AddressesController.list =', typeof ClientAddressesController?.list);
console.log('[diag] AddressesController.newForm =', typeof ClientAddressesController?.newForm);
console.log('[diag] AddressesController.create =', typeof ClientAddressesController?.create);
console.log('[diag] AddressesController.editForm =', typeof ClientAddressesController?.editForm);
console.log('[diag] AddressesController.update =', typeof ClientAddressesController?.update);
console.log('[diag] AddressesController.remove =', typeof ClientAddressesController?.remove);
console.log('[diag] ProfileController.view =', typeof ClientProfileController?.view);
console.log('[diag] ProfileController.update =', typeof ClientProfileController?.update);
console.log('[diag] FavoritesController.list =', typeof ClientFavoritesController?.list);
console.log('[diag] FavoritesController.toggle =', typeof ClientFavoritesController?.toggle);


const router = Router();

// home ->  tipos de comercio
router.get('/home', isAuthForClient, ClientHomeController.index);

// listado de comercios por tipo + busqueda + favoritos
router.get('/commerces', isAuthForClient, ClientCommercesController.list);
router.post('/favorites/:commerceId/toggle', isAuthForClient, ClientFavoritesController.toggle);

// catalogo por comercio (agrupado por categoria)
router.get('/commerces/:commerceId', isAuthForClient, ClientCommercesController.catalog);

// carrito en sesion
router.get('/cart', isAuthForClient, ClientCartController.view);
router.post('/cart/add', isAuthForClient, ClientCartController.add);
router.post('/cart/remove', isAuthForClient, ClientCartController.remove);

// checkout
router.get('/checkout', isAuthForClient, ClientCheckoutController.view);
router.post('/checkout', isAuthForClient, ClientCheckoutController.placeOrder);

// Pedidos
router.get('/orders', isAuthForClient, ClientOrdersController.list);
router.get('/orders/:orderId', isAuthForClient, ClientOrdersController.detail);

// Direcciones
router.get('/addresses', isAuthForClient, ClientAddressesController.list);
router.get('/addresses/new', isAuthForClient, ClientAddressesController.newForm);
router.post('/addresses', isAuthForClient, ClientAddressesController.create);
router.get('/addresses/:id/edit', isAuthForClient, ClientAddressesController.editForm);
router.post('/addresses/:id', isAuthForClient, ClientAddressesController.update);
router.post('/addresses/:id/delete', isAuthForClient, ClientAddressesController.remove);

// Perfil
router.get('/profile', isAuthForClient, ClientProfileController.view);
router.post('/profile', isAuthForClient, ClientProfileController.update);

// favoritos
router.get('/favorites', isAuthForClient, ClientFavoritesController.list);

export default router;
