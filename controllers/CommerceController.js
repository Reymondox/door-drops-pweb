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

//Mantenimiento Productos 

export async function GetProducts(req, res) {
  try {
    const commerceId = req.session.commerce?.id;
    if(!commerceId) {
       req.flash("errors", "Debes iniciar sesión como comercio para ver los productos.");
       return res.redirect("/login"); 
      }

    const productos = await context.ProductsModel.findAll({
      where: { commerceId },
      include: [{ model: context.CategoriesModel}]
    });

    res.render("commerce/productos", {
      pageTitle: "Mantenimiento de Productos",
      productosList: productos.map(p => p.get({ plain: true })),
      hasProductos: productos.length > 0,
      layout: "commerce-layout"
    });
  } catch (err) {
    console.error("Error cargando productos:", err);
    res.status(500).render("errors/500", { error: "Error cargando productos" });
  }
}

export async function GetCreateProduct(req, res) {
  try {
    const categorias = await context.CategoriesModel.findAll();

    res.render("commerce/save-productos", {
      pageTitle: "Crear Producto",
      categoriasList: categorias.map(c => c.get({ plain: true })),
      editMode: false,
      layout: "commerce-layout"
    });
  } catch (err) {
    console.error("Error cargando formulario de creación:", err);
    res.status(500).render("errors/500", { error: "Error cargando formulario" });
  }
}

export async function PostCreateProduct(req, res) {
  const { name, description, price, categorieId } = req.body;
  const imageUrl = req.file ? "/assets/images/product-photo/" + req.file.filename : null;

  try {
    await context.ProductsModel.create({
      name,
      description,
      price,
      categorieId,
      commerceId: req.session.commerce.id,
      imageUrl
    });
    res.redirect("/commerce/productos");
  } catch (err) {
    console.error("Error creando producto:", err);
    res.status(500).render("errors/500", { error: "Error creando producto" });
  }
}

export async function GetEditProduct(req, res) {
  const id = req.params.productId;

  try {
    const producto = await context.ProductsModel.findByPk(id);
    const categorias = await context.CategoriesModel.findAll();

    if (!producto) return res.redirect("/commerce/productos");

    res.render("commerce/save-productos", {
      pageTitle: "Editar Producto",
      producto: producto.get({ plain: true }),
      categoriasList: categorias.map(c => c.get({ plain: true })),
      editMode: true,
      layout: "commerce-layout"
    });
  } catch (err) {
    console.error("Error cargando producto para editar:", err);
    res.status(500).render("errors/500", { error: "Error cargando producto" });
  }
}

export async function PostEditProduct(req, res) {
  const { productId, name, description, price, categorieId } = req.body;
  const imageUrl = req.file ? "/assets/images/product-photo/" + req.file.filename : null;

  try {
    const producto = await context.ProductsModel.findByPk(productId);
    if (!producto) return res.redirect("/commerce/productos");

    producto.name = name;
    producto.description = description;
    producto.price = price;
    producto.categorieId = categorieId;
    if (imageUrl) producto.imageUrl = imageUrl;

    await producto.save();
    res.redirect("/commerce/productos");
  } catch (err) {
    console.error("Error editando producto:", err);
    res.status(500).render("errors/500", { error: "Error editando producto" });
  }
}

export async function GetDeleteProduct(req, res) {
  const id = req.params.productId;

  try {
    const producto = await context.ProductsModel.findByPk(id);
    if (!producto) return res.redirect("/commerce/productos");

    res.render("commerce/save-productos", {
      pageTitle: "Eliminar Producto",
      producto: producto.get({ plain: true }),
      layout: "commerce-layout"
    });
  } catch (err) {
    console.error("Error cargando producto para eliminar:", err);
    res.status(500).render("errors/500", { error: "Error cargando producto" });
  }
}

export async function PostDeleteProduct(req, res) {
  const { productId } = req.body;

  try {
    await context.ProductsModel.destroy({ where: { id: productId } });
    res.redirect("/commerce/productos");
  } catch (err) {
    console.error("Error eliminando producto:", err);
    res.status(500).render("errors/500", { error: "Error eliminando producto" });
  }
}
