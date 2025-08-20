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
        const activeUsers = await context.UsersModel.findAll({
            where: {status: "ACTIVE"},
            include: [{model: context.RolesModel,
            as: "Role"}]
        });

        let activeAdmins = 0;
        let activeClients = 0;
        let activeDeliveries = 0;
        let activeCommerces = 0;

        activeUsers.forEach(user => {
            switch(user.Role.name){
                case "admin":
                    activeAdmins++;
                    break
                case "client":
                    activeClients++;
                    break
                case "delivery":
                    activeDeliveries++;
                    break
                case "commerce":
                    activeCommerces++;
            }
        });

        const inactiveUsers = await context.UsersModel.findAll({
            where: {status: {[Op.not] :"ACTIVE"}},
            include: [{model: context.RolesModel,
            as: "Role"}]
        });

        let inactiveAdmins  = 0;
        let inactiveClients = 0;
        let inactiveDeliveries = 0;
        let inactiveCommerces = 0;

        inactiveUsers.forEach(user => {
            switch(user.Role.name){
                case "admin":
                    inactiveAdmins++;
                    break
                case "client":
                    inactiveClients++;
                    break
                case "delivery":
                    inactiveDeliveries++;
                    break
                case "commerce":
                    inactiveCommerces++;
            }
        });
        const totalOrders = await context.OrdersModel.count();

        const today = new Date();
        today.setHours(0, 0, 0, 0)

        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1); 

        const totalOrdersToday = await context.OrdersModel.count({
            where: {
              orderedAt: {
                [Op.gte]: today,
                [Op.lt]: tomorrow, 
              }
            }
          });

        const totalProducts = await context.ProductsModel.count();

    return res.render("admin/home",{
        totalOrders: totalOrders,
        totalOrdersToday: totalOrdersToday,
        totalProducts: totalProducts,
        activeCommerces: activeCommerces,
        inactiveCommerces: inactiveCommerces,
        activeClients: activeClients,
        inactiveClients: inactiveClients,
        activeDeliveries: activeDeliveries,
        inactiveDeliveries: inactiveDeliveries,
        activeAdmins: activeAdmins,
        inactiveAdmins: inactiveAdmins,
        "page-title": "Door Drops - Home", layout: "admin-layout" }
    );

    }catch(err){
        console.error(`Error fetching home dashboard data in: ${err}`);
        req.flash("errors", "Ha ocurrido un error cargando los datos del panel del Home.")
        return res.redirect("/admin/home")   
    }
};

export async function GetClients(req, res, next){
    try{
        const clients = await context.UsersModel.findAll({
            attributes: [
              'id', 'name', 'lastName', 'phoneNumber', 'email', 'status',
              [context.OrdersModel.sequelize.fn('COUNT', context.OrdersModel.sequelize.col('Orders.id')), 'totalOrders']
            ],
            include: [{
              model: context.RolesModel,
              as: 'Role',
              where: { name: 'client' },
              required: true,
            }, {
              model: context.OrdersModel,
              as: 'Orders',
              attributes: [],
            }],
            group: ['Users.id', 'Role.id'],
            raw: true,
          });

        return res.render("admin/clients",{
            clientsList: clients,
            hasClients: clients.length > 0,
            "page-title": "Door Drops - Lista de Clientes", layout: "admin-layout" }
        )

    }catch(err){
        console.error(`Error fetching clients in: ${err}`);
        req.flash("errors", "Ha ocurrido un error cargando los clientes.")
        return res.redirect("/admin/clients")  
    }
}

export async function ChangeClientStatus(req, res, next){
    try{
        const { clientId } = req.body

        const client = await context.UsersModel.findOne({where: {id: clientId}})

        if(!client){
            res.reditect("/admin/clients")
        }

        switch(client.status){
            case "ACTIVE":
                client.status = "DEACTIVATED"
                client.deletedAt = Date.now()
                await client.save();
                req.flash("success", `Se ha desactivado el cliente ${client.name} ${client.lastName}.`)
                break
            case "DEACTIVATED":
                client.status = "ACTIVE"
                client.deletedAt = null
                await client.save();
                req.flash("success", `Se ha activado el cliente ${client.name} ${client.lastName}`)
                break
            case "ACTIVATING":
                req.flash("errors", `El cliente ${client.name} ${client.lastName} no se puede desactivar porque está en proceso de activación.`)
                break
        }

        return res.redirect("/admin/clients");  

    }catch(err){
        console.error(`Error changing commerce status in: ${err}`);
        req.flash("errors", "Ha ocurrido un error cambiando el status del comercio.")
        return res.redirect("/admin/commerces")  
    }
}

export async function GetDeliveries(req, res, next){
    try{
        const deliveries = await context.UsersModel.findAll({
            attributes: [
              'id', 'name', 'lastName', 'phoneNumber', 'email', 'status',
              [context.OrdersModel.sequelize.fn('COUNT', context.OrdersModel.sequelize.col('Delivery.Orders.id')), 'totalOrders']
            ],
            include: [{
              model: context.RolesModel,
              as: 'Role',
              where: { name: 'delivery' },
              required: true,
            }, {
              model: context.DeliveriesModel,
              as: 'Delivery',
              attributes: [],
              include: [{ 
                model: context.OrdersModel,
                as: 'Orders',
                attributes: [],
                where: {
                    status: 'COMPLETED'
                  }
              }],
              required: false,
            }],
            group: ['Users.id', 'Role.id', 'Delivery.id'],
            raw: true,
          });

        return res.render("admin/deliveries",{
            deliveriesList: deliveries,
            hasDeliveries: deliveries.length > 0,
            "page-title": "Door Drops - Lista de Deliveries", layout: "admin-layout" }
        )

    }catch(err){
        console.error(`Error fetching deliveries in: ${err}`);
        req.flash("errors", "Ha ocurrido un error cargando los deliveries.")
        return res.redirect("/admin/deliveries")  
    }
}       

export async function ChangeDeliveryStatus(req, res, next){
    try{
        const { deliveryId } = req.body

        const delivery = await context.UsersModel.findOne({where: {id: deliveryId}});

        if(!delivery){
            res.reditect("/admin/deliveries")
        }

        switch(delivery.status){
            case "ACTIVE":
                delivery.status = "DEACTIVATED"
                delivery.deletedAt = Date.now()
                await delivery.save();
                req.flash("success", `Se ha desactivado el delivery ${delivery.name} ${delivery.lastName}.`)
                break
            case "DEACTIVATED":
                delivery.status = "ACTIVE"
                delivery.deletedAt = null
                await delivery.save();
                req.flash("success", `Se ha activado el delivery ${delivery.name} ${delivery.lastName}`)
                break
            case "ACTIVATING":
                req.flash("errors", `El delivery ${delivery.name} ${delivery.lastName} no se puede desactivar porque está en proceso de activación.`)
                break
        }

        return res.redirect("/admin/deliveries");  

    }catch(err){
        console.error(`Error changing delivery status in: ${err}`);
        req.flash("errors", "Ha ocurrido un error cambiando el status del delivery.")
        return res.redirect("/admin/deliveries")  
    };
};

export async function GetCommerces(req, res, next){
    try{
        const commercesResult = await context.UsersModel.findAll({
            attributes: [
              'id', 'profileName', 'imageUrl', 'phoneNumber', 'email', 'status',
              [context.OrdersModel.sequelize.fn('COUNT', context.OrdersModel.sequelize.col('Commerce.Orders.id')), 'totalOrders']
            ],
            include: [{
              model: context.RolesModel,
              as: 'Role',
              where: { name: 'commerce' },
              required: true,
            }, {
              model: context.CommercesModel,
              as: 'Commerce',
              attributes: ['openingHour', 'closingHour'],
              include: [{ 
                model: context.OrdersModel,
                as: 'Orders',
                attributes: [],
              }],
              required: true,
            }],
            group: ['Users.id', 'Role.id', 'Commerce.id']
          });

          const commerces = commercesResult.map((commercesResult) => commercesResult.get({plain: true}));

        return res.render("admin/commerces",{
            commercesList: commerces,
            hasCommerces: commerces.length > 0,
            "page-title": "Door Drops - Lista de Comercios", layout: "admin-layout" }
        )

    }catch(err){
        console.error(`Error fetching commerces in: ${err}`);
        req.flash("errors", "Ha ocurrido un error cargando los comercios.")
        return res.redirect("/admin/commerces")  
    };
};

export async function ChangeCommerceStatus(req, res, next){
    try{
        const { commerceId } = req.body

        const commerce = await context.UsersModel.findOne({where: {id: commerceId}})

        if(!commerce){
            res.reditect("/admin/commerces")
        }

        switch(commerce.status){
            case "ACTIVE":
                commerce.status = "DEACTIVATED"
                commerce.deletedAt = Date.now()
                await commerce.save();
                req.flash("success", `Se ha desactivado el comercio ${commerce.profileName}.`)
                break
            case "DEACTIVATED":
                commerce.status = "ACTIVE"
                commerce.deletedAt = null
                await commerce.save();
                req.flash("success", `Se ha activado el comercio ${commerce.profileName}.`)
                break
            case "ACTIVATING":
                req.flash("errors", `El comercio ${commerce.profileName} no se puede desactivar porque está en proceso de activación.`)
                break
        }

        return res.redirect("/admin/commerces");  

    }catch(err){
        console.error(`Error changing commerce status in: ${err}`);
        req.flash("errors", "Ha ocurrido un error cambiando el status del comercio.")
        return res.redirect("/admin/commerces")  
    };
};

export async function GetAdmins(req, res, next){
    try{
        const adminsResult = await context.UsersModel.findAll({
            attributes: ['id', 'name', 'lastName', 'profileName', 'phoneNumber',  'email', 'status',],
            where: {
                id: { [Op.ne]: req.session.user.id }
            },
            include: [{
                model: context.AdminsModel,
                as: "Admin",
                required: true,
                attributes: ['idCard']
            }]
        });  

        const admins = adminsResult.map((adminsResult) => adminsResult.get({plain: true}));

        return res.render("admin/admins",{
            adminsList: admins,
            hasAdmins: admins.length > 0,
            "page-title": "Door Drops - Lista de Administradores", layout: "admin-layout" }
        )

    }catch(err){
        console.error(`Error fetching admins in: ${err}`);
        req.flash("errors", "Ha ocurrido un error obteniendo los administradores.")
        return res.redirect("/admin/admins")  
    };
};

export async function ChangeAdminStatus(req, res, next){
    try{
        const { adminId } = req.body;

        if(adminId == req.session.user.id){
            req.flash("errors", "No puede alterar el status de su propia cuenta.")
            return res.redirect("/admin/admins")
        }

        const admin = await context.UsersModel.findOne({where: {id: adminId}})

        if(!admin){
            res.reditect("/admin/admins")
        }

        switch(admin.status){
            case "ACTIVE":
                admin.status = "DEACTIVATED"
                admin.deletedAt = Date.now()
                await admin.save();
                req.flash("success", `Se ha desactivado el administrador ${admin.name} ${admin.lastName}.`)
                break
            case "DEACTIVATED":
                admin.status = "ACTIVE"
                admin.deletedAt = null
                await admin.save();
                req.flash("success", `Se ha activado el administrador ${admin.name} ${admin.lastName}.`)
                break
            case "ACTIVATING":
                req.flash("errors", `El administrador ${admin.name} ${admin.lastName} no se puede desactivar porque está en proceso de activación.`)
                break
        }

        return res.redirect("/admin/admins");  

    }catch(err){
        console.error(`Error changing admin status in: ${err}`);
        req.flash("errors", "Ha ocurrido un error cambiando el status del administrador.")
        return res.redirect("/admin/admins")  
    };
};

export function GetRegisterAdmin(req, res, next){
    return res.render("admin/register-admin",{
         editMode: false, 
        "page-title": "Door Drops - Registrar Administrador", layout: "admin-layout"}
    );
};

export async function PostRegisterAdmin(req, res, next){
    const {adminName, adminLastName, adminPhoneNumber,
         adminPassword, adminPasswordConfirm, adminIdCard
        } = req.body;
    
    const role = await context.RolesModel.findOne({where: {name: "admin"}});

    if(!role){
        req.flash("errors", "No se ha encontrado el rol de administrador en el sistema de roles.");
        return res.redirect("/admin/admins")
    }

    const adminRoleId = role.id;
    const adminEmail = req.body.adminEmail.toLowerCase();
    const adminProfileName = req.body.adminProfileName;
    const imageURL = req.file.path;
    
    const imagePath = "\\" + path.relative("public", imageURL)

    try{
        if (adminPassword !== adminPasswordConfirm){
            req.flash("errors", "Ambas contraseñas no coinciden.")
            return res.redirect("/admin/admins/register-admin")
        }

        const user = await context.UsersModel.findOne({where:{[Op.or]:[{email: adminEmail}, {profileName: adminProfileName}]}});
        if(user){
            req.flash("errors", "Ya existe un usuario registrado con este email o nombre de perfil.")
            return res.redirect("/admin/admins/register-admin")
        }
        
        const adminHashedPassword = await bcrypt.hash(adminPassword, 10);

        const randomBytesAsync = promisify(randomBytes);
        const buffer = await randomBytesAsync(32);
        const token = buffer.toString("hex");

        const expiration = Date.now() + 3600000
        const status = "ACTIVATING"

        const transaction = await Sequelize.transaction();
        try{
            const newUser = await context.UsersModel.create({
            name: adminName,
            lastName: adminLastName,
            profileName: adminProfileName,
            phoneNumber: adminPhoneNumber,
            imageUrl: imagePath,
            email: adminEmail,
            password: adminHashedPassword,
            roleId: adminRoleId,
            status: status
            }, { transaction: transaction });

            await context.AdminsModel.create({
                userId: newUser.id,
                idCard: adminIdCard
            }, {transaction: transaction})

            await context.TokenActivationModel.create({
                userId: newUser.id,
                token: token,
                expirationDate: expiration
            }, {transaction: transaction})

            await context.TokenPasswordModel.create({
                userId: newUser.id,
                token: null,
                expirationDate: null
            }, {transaction: transaction})

            await sendEmail({
                to: adminEmail,
                subject: "Bienvenido al WebLibrary.",
                html: `<h2>Querido ${adminName} ${adminLastName}</h2>
                        <p>Ha sido registrado como administrador. Porfavor haga click en el siguiente link para activar su cuenta:</p>
                        <p><a href="${process.env.APP_URL}/users/activate/${token}">Activar mi Cuenta</a></p>
                        <p>Si usted no se ha registrado, porfavor ignore este correo.</p>`
            });

            await transaction.commit();

            req.flash("success", "Se ha creado el administrador con éxito. Porfavor, pidale que revise su correo para las instrucciones de activación.")
            return res.redirect("/admin/admins");

        }catch(err){
            await transaction.rollback();
            console.log(`Error while saving admin: ${err}`);
            req.flash("errors", "Ha ocurrido un error registrando el administrador.");

            return res.redirect("/admin/admins/register-admin");
        }   

    }catch(err){
        console.log(`Error while saving admin: ${err}`);
        req.flash("errors", "Ha ocurrido un error registrando el administrador.");

    return res.redirect("/admin/admins/register-admin");
    };
};

export async function GetEditAdmin(req, res, next){
    const adminId = req.params.adminId;

    if(!adminId){
        req.flash("errors", "Se necesita un id para editar un administrador.");
        return res.redirect("/admin/admins");
    }

    if(adminId == req.session.user.id){
        req.flash("errors", "No puede editar su propia cuenta.")
        return res.redirect("/admin/admins")
    }

    try{
        const adminResult = await context.UsersModel.findOne({
            where: {id: adminId}, 
            include: [{model: context.AdminsModel,
            as: "Admin"}]});

        if(!adminResult){
            return res.reditect("/admin/admins")
        }

        const admin = adminResult.get({plain: true});

        return res.render("admin/register-admin", {
            editMode: true,
            admin: admin,
            "page-title": `Web Library - Editar Administrador ${admin.name} ${admin.lastName}`, layout: "admin-layout"
        });

    }catch(err){
        console.log(`Error while fetching admin: ${err}`)
        req.flash("errors", "Ha ocurrido un error llamando los datos del administrador.")
        res.redirect("/admin/admins")
    };
};

export async function PostEditAdmin(req, res, next){
    const { adminName, adminLastName, adminPhoneNumber,
        adminPassword, adminPasswordConfirm, adminIdCard,
     adminId } = req.body;

   const adminEmail = req.body.adminEmail.toLowerCase();
   const adminProfileName = req.body.adminProfileName;
   const imageURL = req.file;
   let imagePath = null

   if (adminPassword !== adminPasswordConfirm){
    req.flash("errors", "Ambas contraseñas no coinciden.")
    return res.redirect(`/admin/admins/edit-admin/${adminId}`)
    }

    try{
        const otherUser = await context.UsersModel.findOne({
            where: {
                id: {
                    [Op.ne]: adminId
                },
                [Op.or]: [
                    { email: adminEmail },
                    { profileName: adminProfileName }
                ]
            }
        });

        if(otherUser){
            req.flash("errors", "Ya existe un usuario registrado con este email o nombre de perfil.")
            return res.redirect(`/admin/admins/edit-admin/${adminId}`)
        };

        const user = await context.UsersModel.findOne({
            where: {
                id: adminId
                }});

        if(!user){
            req.flash("errors", "No se ha encontrado el usuario que intenta editar.")
            return res.redirect(`/admin/admins`)
        };

        if(imageURL){
            imagePath = path.join(projectRoot, "public", user.imageUrl);
            if(fs.existsSync(imagePath)){
                fs.unlinkSync(imagePath);
            };

            imagePath = "\\" + path.relative("public", imageURL.path);
        }else{
            imagePath = user.dataValues.imageURL
        }

        let adminHashedPassword;

        if(adminPassword){
            adminHashedPassword = await bcrypt.hash(adminPassword, 10);
        }else{
            adminHashedPassword = user.dataValues.password
        }

        const transaction = await Sequelize.transaction();
        try{
        await context.UsersModel.update({
            name: adminName,
            lastName: adminLastName,
            profileName: adminProfileName,
            phoneNumber: adminPhoneNumber,
            imageUrl: imagePath,
            email: adminEmail,
            password: adminHashedPassword,
        }, {where: {id: adminId}}, {transaction: transaction});

        if(adminIdCard){
            await context.AdminsModel.update({
                idCard: adminIdCard,
            }, {where: {userId: adminId}} , {transaction: transaction})
        }

        await transaction.commit();

        req.flash("success", "Se ha editado el administrador con éxito.")
        return res.redirect("/admin/admins");

        }catch(err){
            transaction.rollback();
            console.log(`Error while saving edited admin data: ${err}`)
            req.flash("errors", "Ha ocurrido un error guardando los datos editados del administrador.")
            return res.redirect("/admin/admins");
        }
    }catch(err){
        console.log(`Error while editing admin: ${err}`)
        req.flash("errors", "Ha ocurrido un error editando los datos del administrador.")
        return res.redirect("/admin/admins");
    }
}