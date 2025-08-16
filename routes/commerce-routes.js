import express from 'express'
import {GetCommerce} from '../controllers/CommerceController.js'
import isAuthForCommerce from '../middlewares/isAuthForCommerce.js';

const router = express.Router();

//Auth Routes
router.get('/home', isAuthForCommerce,GetCommerce);

export default router;