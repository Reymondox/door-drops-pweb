import context from '../context/AppContext.js';
const { Sequelize } = context
import { sendEmail } from '../services/EmailService.js'
import bcrypt from 'bcrypt'
import { promisify } from 'util'
import { randomBytes } from 'crypto'
import { Op } from 'sequelize'
import path from 'path'
import { projectRoot } from '../utils/Path.js';
import fs from 'fs';


export function GetLogin(req, res, next){
        res.render("auth/login",
            {"page-title": "Door Drops - Iniciar Sesión", layout: "anonymous-layout" }
        )
}

export async function PostLogin(req, res, next){
    const {userPassword } = req.body;
    const userEmail = req.body.userEmail.toLowerCase();

    try{    
        const user = await context.UsersModel.findOne({
            where: {email: userEmail}, 
            include: [{
                model: context.TokenActivationModel,
                as: 'TokenActivation'
            }, 
            {   model: context.RolesModel,
                as: 'Role'
        }]
        });


        if(!user){
            req.flash("errors", "No se ha encontrado ningún usuario con este email.")
            return res.redirect("/")
        }   

        const tokenActivation = user.TokenActivation

        if(user.status === "DEACTIVATED"){
            req.flash("errors", "Su cuenta ha sido desactivada manualmente. Porfavor, contacte con un administrador para activarla.")
            return res.redirect("/")
            }

        if(user.status !== "ACTIVE"){
            if(tokenActivation.expirationDate &&
                tokenActivation.expirationDate <= Date.now()){ 
                try{
                    await context.UsersModel.destroy({where: {email: userEmail}})
                    req.flash("errors", "Token de activación expirado. Registre la cuenta nuevamente.")
                    return res.redirect("/users/register")
    
                }catch(err){
                    req.flash("errors", "Ha ocurrido un error al intentar borrar su cuenta con activación expirada.")
                    return res.redirect("/")
                }
            }

            req.flash("errors", "Su cuenta no está activada. Porfavor, revisa tu correo para las instrucciones de activación.")
            return res.redirect("/")
        }

        const isPasswordValid = await bcrypt.compare(userPassword, user.password)
        if(!isPasswordValid){
            req.flash("errors", "Contraseña incorrecta.");
            return res.redirect("/")
        }

        //ELEMENTOS GUARDADOS EN SESION TRAS LOGIN
        req.session.isAuthenticated = true;
        req.session.user = {
            id: user.id,
            name: user.name,
            lastName: user.lastName,
            profileName: user.profileName,
            imageUrl: user.imageUrl,
            email: user.email,
            role: user.Role.name,
            roleId: user.Role.id
        }

        req.session.save((err) => {
            if(err){
                console.error(`Session save error: ${err}`);
                req.flash("errors", "Ha ocurrido un error durante el inicio de sesión.")
                return res.redirect("/")
            }

            return res.redirect("/")
        })

    }catch(err){
        console.error(`Error loging in: ${err}`);
        req.flash("errors", "Ha ocurrido un error durante el inicio de sesión.")
        return res.redirect("/")        
    }
}

export function GetRegisterUser(req, res, next){
    res.render("auth/register-user",
        {"page-title": "Door Drops - Registrar Usuario", 
        layout: "anonymous-layout"}
    )
}

export async function PostRegisterUser(req, res, next){
    const {userName, userLastName, userPhoneNumber,
         userPassword, userPasswordConfirm, userRoleId
        } = req.body;

    const userEmail = req.body.userEmail.toLowerCase();
    const userProfileName = req.body.userProfileName;
    const imageURL = req.file.path;
    
    const imagePath = "\\" + path.relative("public", imageURL)

    try{
        if (userPassword !== userPasswordConfirm){
            req.flash("errors", "Ambas contraseñas no coinciden.")
            return res.redirect("/users/register")
        }

        const user = await context.UsersModel.findOne({where:{[Op.or]:[{email: userEmail}, {profileName: userProfileName}]}});
        if(user){
            req.flash("errors", "Ya existe un usuario registrado con este email o nombre de perfil.")
            return res.redirect("/users/register")
        }
        
        const userHashedPassword = await bcrypt.hash(userPassword, 10);

        const randomBytesAsync = promisify(randomBytes);
        const buffer = await randomBytesAsync(32);
        const token = buffer.toString("hex");

        const expiration = Date.now() + 3600000
        const status = "ACTIVATING"

        const transaction = await Sequelize.transaction();
        try{
            const newUser = await context.UsersModel.create({
            name: userName,
            lastName: userLastName,
            profileName: userProfileName,
            phoneNumber: userPhoneNumber,
            imageUrl: imagePath,
            email: userEmail,
            password: userHashedPassword,
            roleId: userRoleId,
            status: status
            }, { transaction: transaction });

            await context.TokenActivationModel.create({
                userId: newUser.id,
                token: token,
                expirationDate: expiration
            }, {transaction: transaction})

            if(userRoleId === "3"){

                const role = await context.RolesModel.findOne({where: {name: "delivery"}});

                if(role.name === "delivery"){
                    await context.DeliveriesModel.create({
                        userId: newUser.id,
                        status: "FREE"
                    }, {transaction: transaction});
                    };
                    
            };

            await context.TokenPasswordModel.create({
                userId: newUser.id,
                token: null,
                expirationDate: null
            }, {transaction: transaction})

            await sendEmail({
                to: userEmail,
                subject: "Bienvenido al WebLibrary.",
                html: `<h2>Querido ${userName} ${userLastName}</h2>
                        <p>Gracias por registrarse. Porfavor haga click en el siguiente link para activar su cuenta:</p>
                        <p><a href="${process.env.APP_URL}/users/activate/${token}">Activar mi Cuenta</a></p>
                        <p>Si usted no se ha registrado, porfavor ignore este correo.</p>`
            });
    

            await transaction.commit();

            req.flash("success", "Se ha creado el usuario con éxito. Porfavor, revise su correo para las instrucciones de activación.")
            return res.redirect("/");
        }catch(err){
            await transaction.rollback();
            console.log(`Error while saving user: ${err}`);
            req.flash("errors", "Ha ocurrido un error registrando el usuario.");

            return res.redirect("/users/register");
        }   

    }catch(err){
        console.log(`Error while saving user: ${err}`);
        req.flash("errors", "Ha ocurrido un error registrando el usuario.");

    return res.redirect("/users/register");
    }

}

export async function GetRegisterCommerce(req, res, next){
    try{
        const commerceTypesResult = await context.CommerceTypesModel.findAll()
        const commerceTypes =  commerceTypesResult.map((commerceTypesResult) => commerceTypesResult.get({plain: true}));

        res.render("auth/register-commerce",{
            commerceTypesList: commerceTypes,
            hasCommerceTypes: commerceTypes.length > 0,
            "page-title": "Door Drops - Registrar Comercio", 
            layout: "anonymous-layout"}
        )
    }catch(err){
        console.error(`Error fetching commerce types: ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos de los tipos de comercio.");
        return res.redirect("/")
    }
}

export async function PostRegisterCommerce(req, res, next){
    const { commercePhoneNumber, commercePassword, commercePasswordConfirm,
        commerceTypeId, commerceOpeningHour, commerceClosingHour } = req.body;

    const role = await context.RolesModel.findOne({where: {name: "commerce"}});

    console.log(role);

    if(!role){
        req.flash("errors", "No se ha encontrado el rol de comercio. Porfavor, Hable con un admninistrador.");
        return res.redirect("/")
    }
                

    const commerceRoleId = role.id;
    const commerceEmail = req.body.commerceEmail.toLowerCase();
    const commerceProfileName = req.body.commerceProfileName;
    const imageURL = req.file.path;

    const imagePath = "\\" + path.relative("public", imageURL)

    try{
        if (commercePassword !== commercePasswordConfirm){
            req.flash("errors", "Ambas contraseñas no coinciden.")
            return res.redirect("/users/register-commerce")
        }
        const user = await context.UsersModel.findOne({where:{[Op.or]:[{email: commerceEmail}, {profileName: commerceProfileName}]}});
        if(user){
            req.flash("errors", "Ya existe un comercio registrado con este email o nombre.")
            return res.redirect("/users/register-commerce")
        }
        
        const commerceHashedPassword = await bcrypt.hash(commercePassword, 10);

        const randomBytesAsync = promisify(randomBytes);
        const buffer = await randomBytesAsync(32);
        const token = buffer.toString("hex");

        const expiration = Date.now() + 3600000
        const status = "ACTIVATING"

        const transaction = await Sequelize.transaction();
        try{
            const newUser = await context.UsersModel.create({
            profileName: commerceProfileName,
            phoneNumber: commercePhoneNumber,
            imageUrl: imagePath,
            email: commerceEmail,
            password: commerceHashedPassword,
            roleId: commerceRoleId,
            status: status
            }, { transaction: transaction });

            await context.TokenActivationModel.create({
                userId: newUser.id,
                token: token,
                expirationDate: expiration
            }, {transaction: transaction})

            await context.CommercesModel.create({
                userId: newUser.id,
                commerceTypeId: commerceTypeId,
                openingHour: commerceOpeningHour,
                closingHour: commerceClosingHour,
            }, {transaction: transaction})

            await context.TokenPasswordModel.create({
                userId: newUser.id,
                token: null,
                expirationDate: null
            }, {transaction: transaction})

            await sendEmail({
                to: commerceEmail,
                subject: "Bienvenido al WebLibrary.",
                html: `<h2>Estimado administrador del negocio "${commerceProfileName}":</h2>
                        <p>Gracias por el registro. Porfavor haga click en el siguiente link para activar la cuenta del negocio:</p>
                        <p><a href="${process.env.APP_URL}/users/activate/${token}">Activar mi negocio</a></p>
                        <p>Si usted no se ha registrado, porfavor ignore este correo.</p>`
            });
    

            await transaction.commit();

            req.flash("success", "Se ha creado el negocio con éxito. Porfavor, revise el correo para las instrucciones de activación.")
            return res.redirect("/");
        }catch(err){
            await transaction.rollback();
            console.log(`Error while saving commerce: ${err}`);
            req.flash("errors", "Ha ocurrido un error registrando el comercio.");

            return res.redirect("/users/register-commerce");
        }   

    }catch(err){
        console.log(`Error loging in: ${err}`);
        req.flash("errors", "Ha ocurrido un error registrando el negocio.");
        return res.redirect("/users/register-commerce");
    }

}


export async function GetActivate(req, res, next){
    const { token } = req.params;

    if(!token){
        req.flash("errors", "Token de activación inválido/expirado.");
        return res.redirect("/")
    }

    try{
        const user = await context.UsersModel.findOne({
            include: [{
                model: context.TokenActivationModel,
                as: 'TokenActivation',
                required: true, 
                where: {token: token}}]
            });
        
        if(!user){
            req.flash("errors", "Token de activación inválido.");
            return res.redirect("/")
        }

        const tokenActivation = user.TokenActivation

        if(tokenActivation.expirationDate <= Date.now()){ 
            try{
                await context.UsersModel.destroy({where: {email: user.email}})
                req.flash("errors", "Token de activación expirado. Registre la cuenta nuevamente.")
                return res.redirect("/users/register")

            }catch(err){
                req.flash("errors", "Ha ocurrido un error al intentar borrar su cuenta con activación expirada.")
                return res.redirect("/")
            }}
        

        user.status = "ACTIVE";
        tokenActivation.token = null;
        tokenActivation.expirationDate = null;

        try{
            const resultUser = await user.save()
            const resultToken = await tokenActivation.save()
            if(!resultUser || !resultToken ){
                req.flash("errors", "Ha ocurrido un error durante la activación de su cuenta.");
                return res.redirect("/");
            }
    
            req.flash("success", "Se ha activado su cuenta con éxito.")
            res.redirect("/")
    
        }catch(err){
            console.error(`Error while saving user in: ${err}`);
            req.flash("errors", "Ha ocurrido un error durante la activación de su  cuenta.");
        }

    }catch(err){
        console.error(`Error while activating account in: ${err}`);
        req.flash("errors", "Ha ocurrido un error durante la activación de su cuenta.");
        return res.redirect("/")
    }   
}

export function GetLogout(req, res, next){
    req.session.destroy((err) => { if(err){
        console.error(`Error destroying session: ${err}`);
        req.flash("errors", "Ha ocurrido un error cerrando sesión.");
        return res.redirect('/')
    }})
    return res.redirect('/')

}

export function GetForgot(req, res, next){
    res.render("auth/forgot",
        {"page-title": "Door Drops - Olvidé mi Contraseña", layout: "anonymous-layout" }
    )
}

export async function PostForgot(req, res, next){
const userEmail = req.body.userEmail.toLowerCase();

try{
    const user = await context.UsersModel.findOne({
        where: {email: userEmail}, 
        include: [{
        model: context.TokenPasswordModel,
        as: 'TokenPassword'
        }]
    });

    if(!user){
        req.flash("errors", "No se ha encontrado ningún usuario con este email.")
        return res.redirect("/users/forgot")
    }

    const tokenPassword = user.TokenPassword

    if(tokenPassword.expirationDate){
        req.flash("errors", "Token de reinicio de contraseña aún activo. Espere a que expire en 1h.")
        return res.redirect("/users/forgot")
    }


    const randomBytesAsync = promisify(randomBytes);
    const buffer = await randomBytesAsync(32);
    const token = buffer.toString("hex");

    tokenPassword.token = token;
    tokenPassword.expirationDate = Date.now() + 3600000

    try{
        const result = await tokenPassword.save()
        if(!result){
            req.flash("errors", "Ha ocurrido un error durante el reestablecimiento de su contraseña.");
            return res.redirect("/users/forgot");
        }

        await sendEmail({
            to: userEmail,
            subject: "Door Drops - Solicitud de Reinicio de Contraseña.",
            html: `<h2>Estimado ${user.profileName}</h2>
                    <p>Has solicitado un reinicio de contraseña. Porfavor haz click en el link de debajo para reiniciar tu contraseña:</p>
                    <p><a href="${process.env.APP_URL}/users/reset/${token}">Reiniciar contraseña</a></p>
                    <p>Si usted no ha hecho ninguna solicitud, porfavor ignore este mensaje.</p>`
        });

        req.flash("success", "Se ha enviado el link para reiniciar su contraseña a su email.")
        res.redirect("/")

    }catch(err){
        console.error(`Error while saving reset token in: ${err}`);
        req.flash("errors", "Ha ocurrido un error durante el reestablecimiento de su contraseña.");
        return res.redirect("/")    
    }

}catch(err){
    console.error(`Error reseting password in: ${err}`);
    req.flash("errors", "Ha ocurrido un error durante el reestablecimiento de su contraseña.")
    return res.redirect("/")        
}
}

export async function GetReset(req, res, next){
    const { token } = req.params;

    if(!token){
        req.flash("errors", "Token inválido/expirado.");
        return res.redirect("/users/forgot")
    }

    try{
        const user = await context.UsersModel.findOne({
            include: [{
                model: context.TokenPasswordModel,
                required: true, 
                where: {
                    token: token,
                    expirationDate: { [Op.gte]: Date.now() } 
                }
            }]
        });

        if(!user){
            req.flash("errors", "Token inválido/expirado.");
            return res.redirect("/users/forgot");
        }

        res.render("auth/reset", {
            "page-title": "Door Drops - Reiniciar Contraseña",
            layout: "anonymous-layout",
            passwordToken: token,
            userId: user.id
        })
    }catch(err){
        console.error(`Error reseting password in: ${err}`);
        req.flash("errors", "Ha ocurrido un error durante el reestablecimiento de su contraseña.")
        return res.redirect("/users/forgot")     
    }
}

export async function PostReset(req, res, next){
    const { userPasswordToken, userId, userPassword, userPasswordConfirm } = req.body;

    if(userPassword !== userPasswordConfirm){
        req.flash("errors", "Ambas contraseñas no coinciden.");
        return res.redirect(`/users/reset/${userPasswordToken}`);
    }

    try{
        const user = await context.UsersModel.findOne({
            where: {
                id: userId,
            },   
            include: [{
                model: context.TokenPasswordModel,
                as: 'TokenPassword',
                required: true, 
                where: {
                    token: userPasswordToken,
                    expirationDate: { [Op.gte]: Date.now() } 
                }
            }]
        });

        if(!user){
            req.flash("errors", "Token inválido/expirado.");
            return res.redirect("/users/forgot");
        }

        const tokenPassword = user.TokenPassword

        const hashedPassword = await bcrypt.hash(userPassword, 10);
        user.password = hashedPassword;

        tokenPassword.token = null;
        tokenPassword.expirationDate = null;

        try{
            const resultUser = await user.save();
            const resultToken = await tokenPassword.save();

            if(!resultUser || !resultToken){
                req.flash("errors", "Ha ocurrido un error durante el reestablecimiento de su contraseña.");
                return res.redirect("/users/forgot");
            }
    
            req.flash("success", "Se ha reestablecido su contraseña con éxito.")
            res.redirect("/")
    
        }catch(err){
            console.error(`Error while saving user in: ${err}`);
            req.flash("errors", "Ha ocurrido un error durante el reestablecimiento de su contraseña.");
            return res.redirect("/")
        }

    }catch(err){
        console.error(`Error while resetting password in: ${err}`);
        req.flash("errors", "Ha ocurrido un error durante el reestablecimiento de su contraseña.");
        return res.redirect("/")
    }
}