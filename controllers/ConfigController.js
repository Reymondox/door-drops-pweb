import context from '../context/AppContext.js';

export async function GetConfigs(req, res, next){
    try{
        const ITBISResult = await context.ITBISModel.findAll();

        if(!ITBISResult){
            req.flash("errors", "No se ha encontrado el valor de las ITBIS.");
            return res.redirect("/");  
        }

        const ITBIS = ITBISResult.map((ITBISResult) => ITBISResult.dataValues);

        return res.render("admin/configs", {
            ITBIS: ITBIS,
            hasITBIS: ITBIS.length > 0,
            ITBISTitle: "ITBIS",
            "page-title": "Door Drops - Configuración", layout: "admin-layout"
        });

    }catch(err){
        console.error(`Error fetching configs: ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos de configuración.");
        return res.redirect("/");  
    }
}

export async function GetEditITBIS(req, res, next){
    const { configId } = req.params;

    try{
        const result = await context.ITBISModel.findOne({where: {id: configId}});

        if(!result){
            return res.redirect("/");
        }
    

        const ITBIS = result.dataValues;

        return res.render("admin/edit-itbis", {
            ITBIS: ITBIS,
            "page-title": `Door Drops - Editar las ITBIS`, layout: "admin-layout"
        });

    }catch(err){
        console.error(`Error fetching ITBI value: ${err}`);
        req.flash("errors", "Ha ocurrido un error llamando los datos de las ITBIS");
        return res.redirect("/");  
    }
}

export async function PostEditITBIS(req, res, next){
    const { ITBIId, ITBIPercentage } = req.body;

    const numberValue = parseFloat(ITBIPercentage);

    if (!isNaN(numberValue) && numberValue >= 0 && numberValue <= 999) {
    } else {
        req.flash("errors", "Porcentaje inválido. Debe colocar un número positivo menor a 100.");
        return res.redirect(`/admin/configs/edit-itbis/${ITBIId}`);  
    }

    try{

    const ITBI = await context.ITBISModel.findOne({where: {id: ITBIId}});

    if(!ITBI){
      return res.redirect("/admin/configs");  
    }

    await context.ITBISModel.update({
        percentage: ITBIPercentage, 
    },{where: {id: ITBI.id}})

    
    req.flash("success", "Se ha actualizado el porcentaje de ITBIS correctamente.");
    return res.redirect('/admin/configs')

    }catch(err){
        console.error(`Error updating ITBI value: ${err}`);
        req.flash("errors", "Ha ocurrido un error actualizando los datos de las ITBIS.");
        return res.redirect("/");  
    };
};