import context from '../context/AppContext.js';
const { Sequelize } = context;
import { sendEmail } from '../services/EmailService.js'
import bcrypt from 'bcrypt'
import { promisify } from 'util'
import { randomBytes } from 'crypto'
import path from 'path'
import { Op } from 'sequelize';
import { projectRoot } from '../utils/Path.js';
import fs from 'fs';

export async function GetHome(req, res, next){
    try{ 
        const ordersResult = await context.OrdersModel.findAll({
            attributes: [
                'id', 'status', 'orderedAt',
                [context.OrdersProductsModel.sequelize.fn('COUNT', context.OrdersProductsModel.sequelize.col('OrdersProducts.id')), 'totalProducts']
            ],
            where: { deliveryId: req.session.user.id },
            include: [
                {
                    model: CommercesModel,
                    as: "Commerce", 
                    attributes: ['profileName', 'imageUrl']
                },
                {
                    model: OrdersProductsModel,
                    as: "OrdersProducts",
                    attributes: []
                }
            ],
            group: ['Order.id', 'Commerce.id'], 
            raw: true, 
        });

        return res.render("admin/clients",{
            ordersList: ordersResult,
            hasOrders: ordersResult.lenght > 0,
            "page-title": "Door Drops - Lista de Clientes", layout: "delivery-layout" }
        )
    
    }catch(err){
        console.error(`Error fetching home orders data in: ${err}`);
        req.flash("errors", "Ha ocurrido un error cargando los datos de las ordenes en el home.")
        return res.redirect("/deliveries/home")   
    }
}


export async function GetOrderDetails(req, res, next){
    const { orderId } = req.params;

    if(!orderId){
        req.flash("errors", "Se necesita un id para encontrar la orden.")
        return res.redirect("/deliveries/home")  
    }
    
    try{ 
    const result = await  context.OrdersModel.findAll({

        where: {deliveryId: req.session.user.id},
        include: [
       {model: context.CommercesModel, as: "Commerce"},
       {model: context.OrdersProductsModel, as: "OrderProduct"},
       {model: context.ProductsModel, as:  "Product"}
       ]});



    }catch(err){
        console.error(`Error fetching home orders data in: ${err}`);
        req.flash("errors", "Ha ocurrido un error cargando los datos de las ordenes en el home.")
        return res.redirect("/deliveries/home")  
    }
}


