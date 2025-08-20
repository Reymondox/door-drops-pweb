import { where } from 'sequelize';
import context from '../context/AppContext.js'

export function GetCommerce(req, res, next){
        res.render("commerce/home",
            {"page-title": "Door Drops - Commerce", layout: "commerce-layout" }
        )
}

export async function GetCommerceHome(req, res, next) {
  try {
    const userResult = await context.UsersModel.findOne({where: {id: req.session.user.id}});
    const commerceResult = await context.CommercesModel.findOne({where: {userId: req.session.user.id}});
    const user = userResult.get({plain: true});

    if(!commerceResult){
        req.flash("erros", "No se ha encontrado la información de este comercio para mostrar los pedidos.")
        return res.redirect("/commerce/home")
    }

    const ordersResult = await context.OrdersModel.findAll({
    attributes: [
        'id', 'totalPrice', 'status', 'orderedAt',
        [context.OrdersProductsModel.sequelize.fn('COUNT', context.OrdersProductsModel.sequelize.col('OrdersProducts.id')), 'totalProducts']
    ],
    where: { commerceId: commerceResult.id },
    include: [
          
        {
            model: context.OrdersProductsModel,
            as: "OrdersProducts",
            attributes: []
        }
    ],
    group: ['Orders.id'], 
    raw: true, 
});

    // 3. Renderizar la vista
    res.render('commerce/home', {
      pageTitle: 'Home del Comercio',
      ordersList: ordersResult,
      commerce: user,
      layout: 'commerce-layout'
    });

  } catch (err) {
    console.error('Error cargando home del comercio:', err);
    res.status(500).render('errors/500', { error: 'Error cargando pedidos' });
  }
}

export async function GetOrderDetail(req, res, next) {
  const { orderId } = req.params;
  try {
    const commerceResult = await context.CommercesModel.findOne({where: {userId: req.session.user.id}});
    const order = await context.OrdersModel.findOne({
        where: { id: orderId, commerceId: commerceResult.id},
        include: [
            {
                model: context.OrdersProductsModel,
                as: "OrdersProducts",
                attributes: [], 
                include: [{
                    model: context.ProductsModel,
                    as: "Product",
                    attributes: ['name', 'imageUrl', 'price']
                }]
              }
           ]
       });
      
      const check = order.get({ plain: true })
      console.log(check);
    if (!order) {
      return res.redirect('/commerce/home'); 
    }

    res.render('commerce/order-detail', {
      pageTitle: `Detalle Pedido #${order.id}`,
      
      layout: 'commerce-layout'
    });

  } catch (err) {
    console.error('Error cargando detalle del pedido:', err);
    res.status(500).render('errors/500', { error: 'Error cargando detalle del pedido' });
  }
}


// ------------------------------
// Asignar delivery a pedido pendiente
// ------------------------------
export async function PostAssignDelivery(req, res, next) {
  const { orderId } = req.body;

  try {
    const order = await context.OrdersModel.findByPk(orderId);
    if (!order || order.status !== 'PENDING') 
      return res.redirect(`/commerce/orders/${orderId}`);

    const availableDelivery = await context.DeliveriesModel.findOne({ where: { status: 'FREE' } });
    if (!availableDelivery) {
      req.flash('errors', 'No hay delivery disponible en este momento. Intente más tarde.');
      return res.redirect(`/commerce/orders/${orderId}`);
    }

    order.deliveryId = availableDelivery.id;
    order.status = 'IN_PROCESS';
    await order.save();

    availableDelivery.status = 'OCCUPIED';
    await availableDelivery.save();

    req.flash('success', 'Delivery asignado y pedido en proceso.');
    res.redirect(`/commerce/orders/${orderId}`);

  } catch (err) {
    console.error('Error asignando delivery:', err);
    res.status(500).render('errors/500', { error: 'Error asignando delivery' });
  }
}



//Mantenimiento categoria

export async function GetIndex(req, res, next) {
  
  try {
    
    const commerceResult = await context.UsersModel.findOne({where: {id: req.session.user.id}, 
    include: [{ model: context.CommercesModel, as: "Commerce" }]})

    if(!commerceResult){
        req.flash("errors", "No se encontró el comercio al que pertenecerá la categoría");
        res.redirect("/commerce/create")
    }

    const result = await context.CategoriesModel.findAll({
      where: {commerceId: commerceResult.Commerce.id},
      include: [{ model: context.ProductsModel }], 
    });
    
    const categorias = result.map((r) => {
      const categoria = r.get({ plain: true });
      // Aquí usamos el nombre correcto del array devuelto
      categoria.productosCount = categoria.Products ? categoria.Products.length : 0;
      return categoria;
    });

    res.render("commerce/categorias", {
      categoriasList: categorias,
      hasCategorias: categorias.length > 0,
      pageTitle: "Mantenimiento de Categorías", 
      layout: "commerce-layout"
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

    const result = await context.UsersModel.findOne({where: {id: req.session.user.id}, 
    include: [{ model: context.CommercesModel, as: "Commerce" }]})

    if(!result){
        req.flash("errors", "No se encontró el comercio al que pertenecerá la categoría");
        res.redirect("/commerce/create")
    }

    await context.CategoriesModel.create({ name: name, description: description, commerceId: result.Commerce.id });
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

    const result = await context.UsersModel.findOne({where: {id: req.session.user.id}, 
    include: [{ model: context.CommercesModel, as: "Commerce" }]})

     if(!result){
        req.flash("errors", "No se encontró el comercio al que pertenece el producto");
        res.redirect("/")
    }
  
    const productos = await context.ProductsModel.findAll({
      where: {commerceId: result.Commerce.id},
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
    
    const result = await context.UsersModel.findOne({where: {id: req.session.user.id}, 
    include: [{ model: context.CommercesModel, as: "Commerce" }]})

    if(!result){
        req.flash("errors", "No se encontró el comercio al que pertenecerá la categoría");
        res.redirect("/commerce/create")
    }

    const categorias = await context.CategoriesModel.findAll({where: {
      commerceId: result.Commerce.id
    }});

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
  const imageUrl = req.file ? "/assets/images/product-photos/" + req.file.filename : null;

  try {
    
    const result = await context.UsersModel.findOne({where: {id: req.session.user.id}, 
    include: [{ model: context.CommercesModel, as: "Commerce" }]})

    if(!result){
        req.flash("errors", "No se encontró el comercio al que pertenecerá la categoría");
        res.redirect("/commerce/create")
    }

    await context.ProductsModel.create({
      name: name,
      description: description,
      price: price,
      categorieId: categorieId,
      imageUrl: imageUrl,
      commerceId: result.Commerce.id
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
  const imageUrl = req.file ? "/assets/images/product-photos/" + req.file.filename : null;

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
