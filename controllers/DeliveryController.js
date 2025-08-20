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
        const deliveryResult = await context.DeliveriesModel.findOne({where: {userId: req.session.user.id}});

        if(!deliveryResult){
            req.flash("errors", "No se ha encontrado tu información de delivery para los pedidos.")
            return res.redirect("/")
        }

        const delivery = deliveryResult.get({plain: true});
        
        const ordersResult = await context.OrdersModel.findAll({
            attributes: [
                ['id', 'orderId'], 'status', 'orderedAt', 'totalPrice',
                [context.OrdersProductsModel.sequelize.fn('COUNT', context.OrdersProductsModel.sequelize.col('OrdersProducts.id')), 'totalProducts'],
                'Commerce.User.id',
                'Commerce.User.profileName',
                'Commerce.User.imageUrl'
              ],
              where: { deliveryId: delivery.id },
              include: [
                {
                  model: context.CommercesModel,
                  as: "Commerce",
                  attributes: [],
                  include: [{
                    model: context.UsersModel,
                    as: "User",
                    attributes: []
                  }]
                },
                {
                  model: context.OrdersProductsModel,
                  as: "OrdersProducts",
                  attributes: []
                }
              ],
              group: [
                'Orders.id',
                'Orders.status',
                'Orders.orderedAt',
                'Orders.totalPrice',
                'Commerce.id',
                'Commerce->User.id',
                'Commerce->User.profileName',
                'Commerce->User.imageUrl'
              ],
              raw: true,
            });
            
        const completedOrders = ordersResult.filter(order => order.status === 'COMPLETED');
        const deliveringOrders = ordersResult.filter(order => order.status === 'DELIVERING');

        return res.render("delivery/home",{
            pendingOrdersList: deliveringOrders,
            hasPendingOrdersList: deliveringOrders.length > 0,
            completedOrdersList: completedOrders,
            hasCompletedOrdersList: completedOrders.length > 0,
            "page-title": "Door Drops - Inicio", layout: "delivery-layout" }
        )
    
    }catch(err){
        console.error(`Error fetching home orders data in: ${err}`);
        req.flash("errors", "Ha ocurrido un error cargando los datos de las ordenes en el home.")
        return res.redirect("/delivery/home")   
    }
}


export async function GetOrderDetails(req, res, next){
    const { orderId } = req.params;

    if (!orderId){
        req.flash("errors", "Se necesita un id para encontrar la orden.");
        return res.redirect("/delivery/home");
    }
    
    try{
        const deliveryResult = await context.DeliveriesModel.findOne({where: {userId: req.session.user.id}});

        if(!deliveryResult){
            req.flash("errors", "No se ha encontrado tu información de delivery para los pedidos.")
            return res.redirect("/")
        }

        const delivery = deliveryResult.get({plain: true});

        const orderResult = await context.OrdersModel.findOne({
            where: { id: orderId, deliveryId: delivery.id },
            include: [
                { 
                    model: context.CommercesModel, 
                    include: [{ 
                        model: context.UsersModel, 
                         attributes: ['profileName','imageUrl'] }]},
                { 
                    model: context.OrdersProductsModel,
                     include: [{ 
                        model: 
                        context.ProductsModel, 
                        attributes: ['name','price','imageUrl'] }] }
              ]
        });

    if(!orderResult){
        req.flash("errors", "La orden no existe o no te ha sido asignada.");
        return res.redirect("/delivery/home");
    }

    const orderDetails = orderResult.get({ plain: true });

    return res.render("delivery/order-details",{
        order: orderDetails,
        "page-title": "Door Drops - Detalles de un Pedido", layout: "delivery-layout" }
    )

    }catch(err){
        console.error(`Error fetching order data in: ${err}`);
        req.flash("errors", "Ha ocurrido un error cargando los datos de la orden.")
        return res.redirect("/deliveries/home")  
    };
};

export async function PostOrderDetails(req, res, next){
    const { orderId } = req.body;

    try{
        const deliveryResult = await context.DeliveriesModel.findOne({where: {userId: req.session.user.id}});

        if(!deliveryResult){
            req.flash("errors", "No se ha encontrado tu información de delivery para completar el pedido.")
            return res.redirect("/")
        }

        const delivery = deliveryResult.get({plain: true});

        const orderResult = await context.OrdersModel.findOne({where: {id: orderId, deliveryId: delivery.id}})

        if(!orderResult){
            req.flash("errors", "No se ha encontrado el pedido para completarlo.")
            return res.redirect(`/delivery/order-details/${orderId}`)
        }

        const transaction = await Sequelize.transaction();
        const newOrderStatus = "COMPLETED";
        const newDeliveryStatus = "FREE";
        const newAddress = null;

        try{
            await context.OrdersModel.update(
                { status:  newOrderStatus, address: newAddress}, 
                {where: {
                        id: orderId, 
                        deliveryId: delivery.id
                }}, 
                {transaction: transaction});

            await context.DeliveriesModel.update(
                { status: newDeliveryStatus}, 
                {where: {
                        id: delivery.id, 
                        userId: req.session.user.id
                }}, 
                {transaction: transaction});

            await transaction.commit();

        }catch(err){
            await transaction.rollback();
            console.error(`Error saving order completition in: ${err}`);
            req.flash("errors", "Ha ocurrido un error completando la orden.")
            return res.redirect("/delivery/home")  
        }

        
        req.flash("success", `Se ha completado el pedido #${orderId}`)
        return res.redirect("/delivery/home")
    
        }catch(err){
            console.error(`Error fetching order data in: ${err}`);
            req.flash("errors", "Ha ocurrido un error cargando los datos de la orden.")
            return res.redirect("/delivery/home")  
        };
    };


export async function GetProfile(req, res, next){
    const { userId } = req.params

    if(!userId){
        req.flash("errors", "No se pudo encontrar tu perfil.");
        return res.redirect("/delivery/home");
    }

    if(userId != req.session.user.id){
        console.log(req.session.user.id)
        req.flash("errors", "Solo puedes editar tu perfil.");
        return res.redirect("/delivery/home");
    }

    try{
        const userResult = await context.UsersModel.findOne({where: {id: userId}})

        if(!userResult){
            req.flash("errors", "No se pudieron encontrar los datos de tu usuario.");
            return res.redirect("/delivery/home");
        }

        const delivery = userResult.get({plain: true});

        return res.render("delivery/profile", {
            delivery: delivery,
            "page-title": `Web Library - Mi Perfil ${delivery.name} ${delivery.lastName}`, layout: "delivery-layout"
        });

    }catch(err){
        console.log(`Error while fetching profile: ${err}`)
        req.flash("errors", "Ha ocurrido un error llamando los datos de tu usuario.")
        res.redirect("/delivery/home")
    }
}
  
export async function PostProfile(req, res, next) {
    const { deliveryName, deliveryLastName, deliveryPhoneNumber,
     deliveryId } = req.body;

     const imageURL = req.file;
     let imagePath = null


     if(!deliveryId){
        req.flash("errors", "Ha ocurrido un error editando la información de su usuario.");
        return res.redirect("/delivery/profile");
     }

     if(deliveryId != req.session.user.id){
        req.flash("errors", "Solo puedes alterar tu usuario.");
        return res.redirect("/delivery/profile");
     }

     try{
        const user = await context.UsersModel.findOne({where: {id: deliveryId} })

        if(!user){
            req.flash("errors", "Solo puedes alterar tu usuario.");
            return res.redirect("/delivery/profile");
        }

        if(imageURL){
            imagePath = path.join(projectRoot, "public", user.imageUrl);
            if(fs.existsSync(imagePath)){
                fs.unlinkSync(imagePath);
            };

            imagePath = "\\" + path.relative("public", imageURL.path);
        }else{
            imagePath = user.dataValues.imageURL
        }

        await context.UsersModel.update({
            name: deliveryName,
            lastName: deliveryLastName,
            phoneNumber: deliveryPhoneNumber,
            imageUrl: imagePath,
        }, {where: {id: deliveryId}});

    req.flash("success", "Se ha editado el perfil con éxito.")
    return res.redirect(`/delivery/profile/${deliveryId}`);

     }catch(err){
        console.log(`Error while editing profile: ${err}`)
        req.flash("errors", "Ha ocurrido un error guardando los cambios del perfil.")
        res.redirect("/delivery/home")
     }
}