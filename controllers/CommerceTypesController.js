import context from '../context/AppContext.js';
import path from 'path'
import { projectRoot } from '../utils/Path.js';
import { fn, col } from 'sequelize';
import fs from 'fs';

export async function GetCommerceTypes(req, res, next){
    try{
        const result = await context.CommerceTypesModel.findAll({
            attributes: [
                'id',
                'name',
                'description',
                'imageUrl',
                [fn('COUNT', col('Commerces.id')), 'commerceCount']
            ],
            include: [{
                model: context.CommercesModel,
                attributes: []
            }],
            group: ['CommerceTypes.id'],
        });

        const commerceTypes = result.map((result) => result.dataValues);

        return res.render("admin/commerce-types", {
            commerceTypesList: commerceTypes,
            hasCommerceTypes: commerceTypes.length > 0,
            "page-title": "Door Drops - Lista de Tipos de Comercio", layout: "admin-layout"
        });

    }catch(err){
        console.error(`Error fetching commerce types: ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos de los tipos de comercio.");
        return res.redirect("/");  
    }
}

export function GetRegisterCommerceType(req, res, next){
   return res.render("admin/register-commerce-type", {editMode: false, "page-title": "Door Drops - Registrar Tipo de Comercio", layout: "admin-layout"})
}

export async function PostRegisterCommerceType(req, res, next){
    const { commerceTypeName, commerceTypeDescription } = req.body

    const imageURL = req.file.path;
    
    const imagePath = "\\" + path.relative("public", imageURL)

    try{
        await context.CommerceTypesModel.create({
            name: commerceTypeName,
            description: commerceTypeDescription,
            imageUrl: imagePath
        })

        req.flash("success", "Se ha creado el tipo de comercio con éxito.")
        return res.redirect("/admin/commerce-types");

    }catch(err){
        console.error(`Error creating commerce type: ${err}`)
        req.flash("errors", "Ha ocurrido un error creando el tipo de comercio.");
        return res.redirect("/admin/commerce-types");
    }
}

export async function GetEditCommerceType(req, res, next){
    const { commerceTypeId } = req.params;

    try{
        const result = await context.CommerceTypesModel.findOne({where: {id: commerceTypeId}});

        if(!result){
            return res.redirect("/admin/commerce-types");
        }
    
        const commerceType = result.dataValues;
    
        return res.render("admin/register-commerce-type", {
            editMode: true,
            commerceType: commerceType,
            "page-title": `Door Drops - Editar Tipo de Comercio ${commerceType.name}`, layout: "admin-layout"
        });

    }catch(err){
        console.error(`Error fetching commerce type: ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos del tipo de comercio.");
    }
}

export async function PostEditCommerceType(req, res, next){
    const { commerceTypeName, commerceTypeDescription, commerceTypeId } = req.body

    const imageURL = req.file;
    let imagePath = null;

    try{
        const commerceType = await context.CommerceTypesModel.findOne({where: {id: commerceTypeId}});

        if(!commerceType){
            return res.redirect("/admin/commerce-types");
        }

        if(imageURL){
            imagePath = path.join(projectRoot, "public", commerceType.imageUrl);
            if(fs.existsSync(imagePath)){
                fs.unlinkSync(imagePath);
            };

            imagePath = "\\" + path.relative("public", imageURL.path);
        }else{
            imagePath = commerceType.dataValues.imageURL
        }
    
        try{
            await context.CommerceTypesModel.update(
                {
                    name: commerceTypeName,
                    description: commerceTypeDescription,
                    imageUrl: imagePath
                },
                {where: {id: commerceTypeId}});
                
                req.flash("success", "Se ha editado el tipo de comercio con éxito.")
                return res.redirect("/admin/commerce-types")
    
        }catch(err){
            console.error(`Error updating commerce type: ${err}`);
            req.flash("errors", "Ha ocurrido un error actualizando el tipo de comercio.");
            return res.redirect("/admin/commerce-types");
        }
    
    }catch(err){
        console.error(`Error fetching commerce type: ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos del tipo de comercio.");
        return res.redirect("/admin/commerce-types");
    }
        
}

export async function DeleteCommerceType(req, res, next){
    const {commerceTypeId} = req.body;

    try{
        const result = await context.CommerceTypesModel.findOne({where: {id: commerceTypeId}});

        if(!result){
            return res.redirect("/admin/commerce-types");
        }

        if(result.imageURL){
            const imagePath = path.join(projectRoot, "public", result.imageURL);
            if(fs.existsSync(imagePath)){
                fs.unlinkSync(imagePath);
            }
        }

        try{
            await context.CommerceTypesModel.destroy({where: {id: commerceTypeId}});

            req.flash("success", "Se ha eliminado el tipo de comercio y todos los comercios relacionados con éxito.");
            return res.redirect('/admin/commerce-types');

        }catch(err){
            console.error(`Error deleting commerce type in: ${err}`);
            req.flash("errors", "Ha ocurrido un error eliminando el tipo de comercio.");
            return res.redirect("/admin/commerce-types");
        }
    }catch(err){
        console.error(`Error fetching commerce type in: ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos del tipo de comercio.");
        return res.redirect("/admin/commerce-types");
    }
}