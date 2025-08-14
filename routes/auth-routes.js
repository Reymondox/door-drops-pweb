import express from 'express'
import { GetLogin, 
    PostLogin, 
    GetRegisterUser, 
    PostRegisterUser,
    GetRegisterCommerce,
    PostRegisterCommerce, 
    GetLogout,
    GetForgot,
    PostForgot,  
    GetReset,
    PostReset,
    GetActivate
} from '../controllers/AuthController.js'
import isAuthForLogin from '../middlewares/isAuthForLogin.js'

const router = express.Router();

//Auth Routes
router.get('/', isAuthForLogin, GetLogin);
router.post('/', isAuthForLogin, PostLogin);

router.get('/users/register', isAuthForLogin, GetRegisterUser);
router.post('/users/register', isAuthForLogin, PostRegisterUser);

router.get('/users/register-commerce', isAuthForLogin, GetRegisterCommerce);
router.post('/users/register-commerce', isAuthForLogin, PostRegisterCommerce);

router.get('/users/logout', GetLogout);
router.get('/users/forgot', isAuthForLogin, GetForgot);

router.post('/users/forgot', isAuthForLogin, PostForgot);
router.get('/users/reset/:token', isAuthForLogin, GetReset);

router.post('/users/reset', isAuthForLogin, PostReset);

router.get("/users/activate/:token", isAuthForLogin, GetActivate)
export default router;