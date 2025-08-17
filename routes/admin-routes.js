import express from 'express'
import { 
    GetHome, 
    GetClients, 
    ChangeClientStatus, 
    GetDeliveries,
    ChangeDeliveryStatus,
    GetCommerces,
    ChangeCommerceStatus,
    GetAdmins,
    ChangeAdminStatus,
    GetRegisterAdmin,
    PostRegisterAdmin,
    GetEditAdmin,
    PostEditAdmin,
} from '../controllers/AdminController.js'

import {
    GetCommerceTypes,
    GetRegisterCommerceType,
    PostRegisterCommerceType,
    GetEditCommerceType,
    PostEditCommerceType,
    DeleteCommerceType
} from '../controllers/CommerceTypesController.js'

import {
    GetConfigs,
    GetEditITBIS,
    PostEditITBIS
} from '../controllers/ConfigController.js'


import isAuthForAdmin from '../middlewares/isAuthForAdmin.js'

const router = express.Router();

//Series route
router.get('/home', isAuthForAdmin, GetHome);

router.get("/clients", isAuthForAdmin, GetClients);
router.post("/clients/change-status", isAuthForAdmin, ChangeClientStatus);

router.get("/deliveries", isAuthForAdmin, GetDeliveries);
router.post("/deliveries/change-status", isAuthForAdmin, ChangeDeliveryStatus);

router.get("/commerces", isAuthForAdmin, GetCommerces);
router.post("/commerces/change-status", isAuthForAdmin, ChangeCommerceStatus);

router.get("/admins", isAuthForAdmin, GetAdmins);
router.post("/admins/change-status", isAuthForAdmin, ChangeAdminStatus);

router.get("/admins/register-admin", isAuthForAdmin, GetRegisterAdmin);
router.post("/admins/register-admin", isAuthForAdmin, PostRegisterAdmin);

router.get('/admins/edit-admin/:adminId', isAuthForAdmin, GetEditAdmin);
router.post('/admins/edit-admin', isAuthForAdmin, PostEditAdmin);

router.get("/commerce-types", isAuthForAdmin, GetCommerceTypes);
 
router.get("/commerce-types/register-commerce-type", isAuthForAdmin, GetRegisterCommerceType);
router.post("/commerce-types/register-commerce-type", isAuthForAdmin, PostRegisterCommerceType);

router.get('/commerce-types/edit-commerce-type/:commerceTypeId', isAuthForAdmin, GetEditCommerceType);
router.post('/commerce-types/edit-commerce-type', isAuthForAdmin, PostEditCommerceType);

router.post('/commerce-types/delete-commerce-type', isAuthForAdmin, DeleteCommerceType)

router.get("/configs", isAuthForAdmin, GetConfigs);

router.get('/configs/edit-itbis/:configId', isAuthForAdmin, GetEditITBIS);
router.post('/configs/edit-itbis', isAuthForAdmin, PostEditITBIS);

export default router;