import context from '../context/AppContext.js'

export function GetCommerce(req, res, next){
        res.render("commerce/home",
            {"page-title": "Door Drops - Commerce", layout: "commerce-layout" }
        )
}
//Mantenimiento categoria
export async function GetIndex(req, res, next) {
  try {
    const result = await context.CategoriesModel.findAll({
      include: [{ model: context.ProductsModel }], 
    });

    const categorias = result.map((r) => {
      const categoria = r.get({ plain: true });
      categoria.productosCount = categoria.ProductosModels ? categoria.ProductosModels.length : 0;
      return categoria;
    });

    res.render("commerce/categorias", {
      categoriasList: categorias,
      hasCategorias: categorias.length > 0,
      "page-title": "Mantenimiento de Categorías", layout: "commerce-layout"
    });
  } catch (err) {
    console.error("Error fetching categorias:", err);
    res.status(500).render("errors/500", { error: "Error cargando categorías" });
  }
}

export async function GetCreate(req, res, next) {
  try {
    res.render("commerce/save-categorias", {
      editMode: false,
      "page-title": "Nueva Categoría", layout: "commerce-layout"
    });
  } catch (err) {
    console.error("Error cargando formulario:", err);
  }
}

export async function PostCreate(req, res, next) {
  const { name, description } = req.body;

  try {
    if (!name || !description) {
      return res.render("commerce/save-categorias", {
        editMode: false,
        error: "Todos los campos son requeridos",
        "page-title": "Nueva Categoría", layout: "commerce-layout"
      });
    }

    await context.CategoriesModel.create({ name, description });
    return res.redirect("/commerce/categorias");
  } catch (err) {
    console.error("Error creando categoria:", err);
    res.status(500).render("errors/500", { error: "Error creando categoría" });
  }
}

export async function GetEdit(req, res, next) {
  const id = req.params.categoriasId;

  try {
    const categoriaResult = await context.CategoriesModel.findOne({ where: { id: id } });

    if (!categoriaResult) {
      return res.redirect("commerce/categorias");
    }

    const categoria = categoriaResult.get({ plain: true });

    res.render("commerce/save-categorias", {
      editMode: true,
      categoria,
      "page-title": `Editar Categoría: ${categoria.name}`, layout: "commerce-layout"
    });
  } catch (err) {
    console.error("Error cargando categoria para editar:", err);
    res.status(500).render("errors/500", { error: "Error cargando categoría" });
  }
}

export async function PostEdit(req, res, next) {
  const { name, description, categoriasId } = req.body;

  try {
    if (!name || !description) {
      return res.render("commerce/save-categorias", {
        editMode: true,
        error: "Todos los campos son requeridos",
        categoria: { id: categoriasId, name, description },
        "page-title": "Editar Categoría", layout: "commerce-layout"
      });
    }

    await context.CategoriesModel.update(
      { name, description },
      { where: { id: categoriasId } }
    );

    return res.redirect("/commerce/categorias");
  } catch (err) {
    console.error("Error actualizando categoria:", err);
    res.status(500).render("errors/500", { error: "Error actualizando categoría" });
  }
}

export async function GetDelete(req, res, next) {
  const id = req.params.categoriasId;

  try {
    const categoria = await context.CategoriesModel.findOne({ where: { id } });

    if (!categoria) {
      return res.redirect("/commerce/categorias");
    }

    res.render("commerce/save-categorias", {
      categoria: categoria.get({ plain: true }),
      "page-title": `Eliminar Categoría: ${categoria.name}`, layout: "commerce-layout"
    });
  } catch (err) {
    console.error("Error cargando categoria para eliminar:", err);
    res.status(500).render("errors/500", { error: "Error cargando categoría" });
  }
}


export async function PostDelete(req, res, next) {
  const { categoriasId } = req.body;

  try {
    await context.CategoriesModel.destroy({ where: { id: categoriasId } });
    return res.redirect("/commerce/categorias");
  } catch (err) {
    console.error("Error eliminando categoria:", err);
    res.status(500).render("errors/500", { error: "Error eliminando categoría" });
  }
}





