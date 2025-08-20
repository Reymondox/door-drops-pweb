import express from 'express'
import { 
    GetHome,
    GetOrderDetails,
    PostOrderDetails,
    GetProfile,
    PostProfile 
} from '../controllers/DeliveryController.js'
import isAuthForDelivery from '../middlewares/isAuthForDelivery.js'

const router = express.Router();

router.get('/home', isAuthForDelivery, GetHome);

router.get('/order-details/:orderId', isAuthForDelivery, GetOrderDetails);
router.post('/order-details', isAuthForDelivery, PostOrderDetails);

router.get('/profile/:userId', isAuthForDelivery, GetProfile);
router.post('/profile', isAuthForDelivery, PostProfile);

export default router;