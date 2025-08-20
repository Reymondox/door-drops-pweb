import context from '../context/AppContext.js';
const { Sequelize } = context; 
import path from 'path'
import { Op } from 'sequelize';
import { projectRoot } from '../utils/Path.js';
import fs from 'fs';

// ======================
// HOME COMERCIO (shell)
// ======================
export function GetCommerce(req, res, next) {
  try {
    return res.render('commerce/home', {
      "page-title": "Door Drops - Commerce",
      layout: "commerce-layout"
    });
  } catch (err) {
    console.error(`Error rendering commerce home shell: ${err}`);
    req.flash("errors", "Ha ocurrido un error cargando el home del comercio.");
    return res.redirect("/");
  }
}

// ======================
// LISTADO DEL HOME
// ======================
export async function GetCommerceHome(req, res, next) {
  try {
    const userResult = await context.UsersModel.findOne({
      where: { id: req.session.user.id },
      raw: true
    });

    const commerceResult = await context.CommercesModel.findOne({
      where: { userId: req.session.user.id },
      raw: true
    });

    if (!userResult || !commerceResult) {
      req.flash("errors", "No se ha encontrado tu información de comercio para mostrar los pedidos.");
      return res.redirect("/");
    }

    const { fn, col } = context.OrdersModel.sequelize;

    const orders = await context.OrdersModel.findAll({
      attributes: [
        ['id', 'orderId'],
        'status',
        'orderedAt',
        'totalPrice',
        [fn('COUNT', col('OrdersProducts.id')), 'totalProducts']
      ],
      where: { commerceId: commerceResult.id },
      include: [
        {
          model: context.OrdersProductsModel,
          as: 'OrdersProducts',
          attributes: []
        }
      ],
      group: [
        'Orders.id',
        'Orders.status',
        'Orders.orderedAt',
        'Orders.totalPrice'
      ],
      order: [['orderedAt', 'DESC']],
      raw: true
    });

    const toMoney = (n) => Number(n ?? 0).toFixed(2);
    const formatDate = (d) => new Date(d).toLocaleString('es-DO', { hour12: false });

    const mapped = orders.map(o => ({
      orderId: o.orderId,
      status: o.status,                         
      orderedAt: formatDate(o.orderedAt),
      totalPrice: toMoney(o.totalPrice),
      totalProducts: o.totalProducts,
      profileName: userResult.profileName,
      imageUrl: userResult.imageUrl || '/assets/images/placeholder-merchant.png'
    }));

    const pendingOrdersList    = mapped.filter(x => x.status === 'PENDING');
    const inProcessOrdersList  = mapped.filter(x => x.status === 'DELIVERING');
    const completedOrdersList  = mapped.filter(x => x.status === 'COMPLETED');

    return res.render('commerce/home', {
      pendingOrdersList,
      hasPendingOrdersList: pendingOrdersList.length > 0,
      inProcessOrdersList,
      hasInProcessOrdersList: inProcessOrdersList.length > 0,
      completedOrdersList,
      hasCompletedOrdersList: completedOrdersList.length > 0,
      "page-title": "Door Drops - Commerce",
      layout: 'commerce-layout'
    });
  } catch (err) {
    console.error(`Error fetching commerce home data in: ${err}`);
    req.flash("errors", "Ha ocurrido un error cargando los pedidos del comercio.");
    return res.redirect("/commerce/home");
  }
}

// ======================
// DETALLE DE PEDIDO
// ======================
export async function GetOrderDetail(req, res, next) {
  const { orderId } = req.params;

  if (!orderId) {
    req.flash("errors", "Se necesita un id para encontrar la orden.");
    return res.redirect("/commerce/home");
  }

  try {
    const commerceObj = await context.CommercesModel.findOne({
      where: { userId: req.session.user.id }
    });

    const commerce = commerceObj.get({plain: true});

    if (!commerce) {
      req.flash("errors", "No se ha encontrado tu información de comercio para los pedidos.");
      return res.redirect("/");
    }

    const userObj = await context.UsersModel.findOne({
      where: { id: req.session.user.id }
    });

    const user = userObj.get({plain: true});


    if (!user) {
      req.flash("errors", "No se ha encontrado tu información del usuario para los pedidos.");
      return res.redirect("/");
    }

    const orderResult = await context.OrdersModel.findOne({
      where: { id: orderId, commerceId: commerce.id },
      include: [
        {
          model: context.OrdersProductsModel,
          as: 'OrdersProducts',
          attributes: ['id', 'orderId', 'productId'],
          include: [
            {
              model: context.ProductsModel,
              as: 'Product',
              attributes: ['name', 'price', 'imageUrl']
            }
          ]
        }
      ]
    });

    if (!orderResult) {
      req.flash("errors", "La orden no existe o no pertenece a tu comercio.");
      return res.redirect("/commerce/home");
    }

    const toMoney = (n) => Number(n ?? 0).toFixed(2);
    const formatDate = (d) => new Date(d).toLocaleString('es-DO', { hour12: false });

    const plain = orderResult.get({ plain: true });
    const products = (plain.OrdersProducts || []).map(op => {
      const unitPrice = op.Product?.price ?? 0;
      return {
        name: op.Product?.name,
        imageUrl: op.Product?.imageUrl || '/assets/images/product-photos/placeholder.png',
        unitPrice: toMoney(unitPrice),
        quantity: 1,
        lineTotal: toMoney(unitPrice)
      };
    });


    return res.render("commerce/order-detail", {
      order: {
        id: plain.id,
        status: plain.status,
        orderedAt: formatDate(plain.orderedAt),
        totalPrice: toMoney(plain.totalPrice),
        products,
        user: user,
      },
      "page-title": `Door Drops - Detalle Pedido #${plain.id}`,
      layout: "commerce-layout"
    });
  } catch (err) {
    console.error(`Error fetching commerce order data in: ${err}`);
    req.flash("errors", "Ha ocurrido un error cargando los datos de la orden.");
    return res.redirect("/commerce/home");
  }
}

// ======================
// ASIGNAR DELIVERY
// ======================
export async function PostAssignDelivery(req, res, next) {
  const orderId =
    req.body?.orderId ||
    req.params?.orderId ||
    req.query?.orderId;

  console.log('assign-delivery payload →', {
    body: req.body,
    params: req.params,
    query: req.query
  });

  if (!orderId) {
    req.flash("errors", "Se necesita un id de orden para asignar un delivery.");
    return res.redirect("/commerce/home");
  }

  const sequelize = context.OrdersModel.sequelize;
  const transaction = await sequelize.transaction();

  try {
    const commerce = await context.CommercesModel.findOne({
      where: { userId: req.session.user.id },
      transaction
    });

    if (!commerce) {
      await transaction.rollback();
      req.flash("errors", "No se encontró tu información de comercio para asignar delivery.");
      return res.redirect("/commerce/home");
    }

    const order = await context.OrdersModel.findOne({
      where: { id: orderId, commerceId: commerce.id, status: 'PENDING' },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!order) {
      await transaction.rollback();
      req.flash("errors", "La orden no existe o no está pendiente.");
      return res.redirect(`/commerce/orders/${orderId}`);
    }

    const availableDelivery = await context.DeliveriesModel.findOne({
      where: { status: 'FREE' },
      transaction,
      lock: transaction.LOCK.UPDATE
    });

    if (!availableDelivery) {
      await transaction.rollback();
      req.flash('errors', 'No hay delivery disponible en este momento. Intente más tarde.');
      return res.redirect(`/commerce/orders/${orderId}`);
    }

    await context.OrdersModel.update(
      { status: 'DELIVERING', deliveryId: availableDelivery.id },
      { where: { id: order.id }, transaction }
    );

    await context.DeliveriesModel.update(
      { status: 'OCCUPIED' },
      { where: { id: availableDelivery.id }, transaction }
    );

    await transaction.commit();

    req.flash('success', `Delivery asignado. Pedido #${orderId} ahora está en proceso.`);
    return res.redirect(`/commerce/orders/${orderId}`);
  } catch (err) {
    await (transaction?.rollback?.());
    console.error(`Error assigning delivery in: ${err}`);
    req.flash("errors", "Ha ocurrido un error asignando el delivery al pedido.");
    return res.redirect(`/commerce/orders/${orderId}`);
  }
}

// ======================
// CATEGORÍAS (nombres originales)
// ======================
export async function GetIndex(req, res, next) {
  try {
    const commerceOwner = await context.UsersModel.findOne({
      where: { id: req.session.user.id },
      include: [{ model: context.CommercesModel, as: "Commerce" }]
    });

    if (!commerceOwner) {
      req.flash("errors", "No se encontró el comercio al que pertenecerá la categoría");
      return res.redirect("/commerce/create");
    }

    const result = await context.CategoriesModel.findAll({
      where: { commerceId: commerceOwner.Commerce.id },
      include: [{ model: context.ProductsModel }]
    });

    const categorias = result.map((r) => {
      const categoria = r.get({ plain: true });
      categoria.productosCount = Array.isArray(categoria.Products) ? categoria.Products.length : 0;
      return categoria;
    });

    return res.render("commerce/categorias", {
      categoriasList: categorias,
      hasCategorias: categorias.length > 0,
      pageTitle: "Mantenimiento de Categorías",
      layout: "commerce-layout"
    });
  } catch (err) {
    console.error("Error fetching categorias:", err);
    req.flash("errors", "Ha ocurrido un error cargando las categorías.");
    return res.redirect("/commerce/categorias");
  }
}

export async function GetCreate(req, res, next) {
  try {
    return res.render("commerce/save-categorias", {
      editMode: false,
      "page-title": "Nueva Categoría",
      layout: "commerce-layout"
    });
  } catch (err) {
    console.error("Error cargando formulario de categoría:", err);
    req.flash("errors", "Ha ocurrido un error cargando el formulario.");
    return res.redirect("/commerce/categorias");
  }
}

export async function PostCreate(req, res, next) {
  const { name, description } = req.body;

  try {
    if (!name || !description) {
      return res.render("commerce/save-categorias", {
        editMode: false,
        error: "Todos los campos son requeridos",
        "page-title": "Nueva Categoría",
        layout: "commerce-layout"
      });
    }

    const owner = await context.UsersModel.findOne({
      where: { id: req.session.user.id },
      include: [{ model: context.CommercesModel, as: "Commerce" }]
    });

    if (!owner) {
      req.flash("errors", "No se encontró el comercio al que pertenecerá la categoría");
      return res.redirect("/commerce/create");
    }

    await context.CategoriesModel.create({
      name,
      description,
      commerceId: owner.Commerce.id
    });

    return res.redirect("/commerce/categorias");
  } catch (err) {
    console.error("Error creando categoria:", err);
    req.flash("errors", "Ha ocurrido un error creando la categoría.");
    return res.redirect("/commerce/categorias");
  }
}

export async function GetEdit(req, res, next) {
  const id = req.params.categoriasId;

  try {
    const categoriaResult = await context.CategoriesModel.findOne({ where: { id } });

    if (!categoriaResult) {
      req.flash("errors", "La categoría no existe.");
      return res.redirect("/commerce/categorias");
    }

    const categoria = categoriaResult.get({ plain: true });

    return res.render("commerce/save-categorias", {
      editMode: true,
      categoria,
      "page-title": `Editar Categoría: ${categoria.name}`,
      layout: "commerce-layout"
    });
  } catch (err) {
    console.error("Error cargando categoria para editar:", err);
    req.flash("errors", "Ha ocurrido un error cargando la categoría.");
    return res.redirect("/commerce/categorias");
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
        "page-title": "Editar Categoría",
        layout: "commerce-layout"
      });
    }

    await context.CategoriesModel.update(
      { name, description },
      { where: { id: categoriasId } }
    );

    return res.redirect("/commerce/categorias");
  } catch (err) {
    console.error("Error actualizando categoria:", err);
    req.flash("errors", "Ha ocurrido un error actualizando la categoría.");
    return res.redirect("/commerce/categorias");
  }
}

export async function GetDelete(req, res, next) {
  const id = req.params.categoriasId;

  try {
    const categoria = await context.CategoriesModel.findOne({ where: { id } });

    if (!categoria) {
      req.flash("errors", "La categoría no existe.");
      return res.redirect("/commerce/categorias");
    }

    return res.render("commerce/save-categorias", {
      categoria: categoria.get({ plain: true }),
      "page-title": `Eliminar Categoría: ${categoria.name}`,
      layout: "commerce-layout"
    });
  } catch (err) {
    console.error("Error cargando categoria para eliminar:", err);
    req.flash("errors", "Ha ocurrido un error cargando la categoría.");
    return res.redirect("/commerce/categorias");
  }
}

export async function PostDelete(req, res, next) {
  const { categoriasId } = req.body;

  try {
    await context.CategoriesModel.destroy({ where: { id: categoriasId } });
    return res.redirect("/commerce/categorias");
  } catch (err) {
    console.error("Error eliminando categoria:", err);
    req.flash("errors", "Ha ocurrido un error eliminando la categoría.");
    return res.redirect("/commerce/categorias");
  }
}

// ======================
// PRODUCTOS (nombres originales)
// ======================
export async function GetProducts(req, res, next) {
  try {
    const owner = await context.UsersModel.findOne({
      where: { id: req.session.user.id },
      include: [{ model: context.CommercesModel, as: "Commerce" }]
    });

    if (!owner) {
      req.flash("errors", "No se encontró el comercio al que pertenece el producto");
      return res.redirect("/");
    }

    const productos = await context.ProductsModel.findAll({
      where: { commerceId: owner.Commerce.id },
      include: [{ model: context.CategoriesModel }]
    });

    return res.render("commerce/productos", {
      pageTitle: "Mantenimiento de Productos",
      productosList: productos.map(p => p.get({ plain: true })),
      hasProductos: productos.length > 0,
      layout: "commerce-layout"
    });
  } catch (err) {
    console.error("Error cargando productos:", err);
    req.flash("errors", "Ha ocurrido un error cargando los productos.");
    return res.redirect("/commerce/productos");
  }
}

export async function GetCreateProduct(req, res, next) {
  try {
    const owner = await context.UsersModel.findOne({
      where: { id: req.session.user.id },
      include: [{ model: context.CommercesModel, as: "Commerce" }]
    });

    if (!owner) {
      req.flash("errors", "No se encontró el comercio al que pertenecerá la categoría");
      return res.redirect("/commerce/create");
    }

    const categorias = await context.CategoriesModel.findAll({
      where: { commerceId: owner.Commerce.id }
    });

    return res.render("commerce/save-productos", {
      pageTitle: "Crear Producto",
      categoriasList: categorias.map(c => c.get({ plain: true })),
      editMode: false,
      layout: "commerce-layout"
    });
  } catch (err) {
    console.error("Error cargando formulario de creación:", err);
    req.flash("errors", "Ha ocurrido un error cargando el formulario.");
    return res.redirect("/commerce/productos");
  }
}

export async function PostCreateProduct(req, res, next) {
  const { name, description, price, categorieId } = req.body;
  const imageUrl = req.file ? "/assets/images/product-photos/" + req.file.filename : null;

  try {
    const owner = await context.UsersModel.findOne({
      where: { id: req.session.user.id },
      include: [{ model: context.CommercesModel, as: "Commerce" }]
    });

    if (!owner) {
      req.flash("errors", "No se encontró el comercio al que pertenecerá la categoría");
      return res.redirect("/commerce/create");
    }

    await context.ProductsModel.create({
      name,
      description,
      price,
      categorieId,
      imageUrl,
      commerceId: owner.Commerce.id
    });

    return res.redirect("/commerce/productos");
  } catch (err) {
    console.error("Error creando producto:", err);
    req.flash("errors", "Ha ocurrido un error creando el producto.");
    return res.redirect("/commerce/productos");
  }
}

export async function GetEditProduct(req, res, next) {
  const id = req.params.productId;

  try {
    const owner = await context.UsersModel.findOne({
      where: { id: req.session.user.id },
      include: [{ model: context.CommercesModel, as: "Commerce" }]
    });

    if (!owner) {
      req.flash("errors", "No se encontró el comercio al que pertenecerá la categoría");
      return res.redirect("/commerce/create");
    }

    const producto = await context.ProductsModel.findOne({ where: { id } });
    const categorias = await context.CategoriesModel.findAll({
      where: { commerceId: owner.Commerce.id }
    });

    if (!producto) {
      req.flash("errors", "El producto no existe.");
      return res.redirect("/commerce/productos");
    }

    return res.render("commerce/save-productos", {
      pageTitle: "Editar Producto",
      producto: producto.get({ plain: true }),
      categoriasList: categorias.map(c => c.get({ plain: true })),
      editMode: true,
      layout: "commerce-layout"
    });
  } catch (err) {
    console.error("Error cargando producto para editar:", err);
    req.flash("errors", "Ha ocurrido un error cargando el producto.");
    return res.redirect("/commerce/productos");
  }
}

export async function PostEditProduct(req, res, next) {
  const { productId, name, description, price, categorieId } = req.body;
  const imageUrl = req.file ? "/assets/images/product-photos/" + req.file.filename : null;

  try {
    const producto = await context.ProductsModel.findByPk(productId);
    if (!producto) {
      req.flash("errors", "El producto no existe.");
      return res.redirect("/commerce/productos");
    }

    producto.name = name;
    producto.description = description;
    producto.price = price;
    producto.categorieId = categorieId;
    if (imageUrl) producto.imageUrl = imageUrl;

    await producto.save();
    return res.redirect("/commerce/productos");
  } catch (err) {
    console.error("Error editando producto:", err);
    req.flash("errors", "Ha ocurrido un error editando el producto.");
    return res.redirect("/commerce/productos");
  }
}

export async function GetDeleteProduct(req, res, next) {
  const id = req.params.productId;

  try {
    const producto = await context.ProductsModel.findByPk(id);
    if (!producto) {
      req.flash("errors", "El producto no existe.");
      return res.redirect("/commerce/productos");
    }

    return res.render("commerce/save-productos", {
      pageTitle: "Eliminar Producto",
      producto: producto.get({ plain: true }),
      layout: "commerce-layout"
    });
  } catch (err) {
    console.error("Error cargando producto para eliminar:", err);
    req.flash("errors", "Ha ocurrido un error cargando el producto.");
    return res.redirect("/commerce/productos");
  }
}

export async function PostDeleteProduct(req, res, next) {
  const { productId } = req.body;

  try {
    await context.ProductsModel.destroy({ where: { id: productId } });
    return res.redirect("/commerce/productos");
  } catch (err) {
    console.error("Error eliminando producto:", err);
    req.flash("errors", "Ha ocurrido un error eliminando el producto.");
    return res.redirect("/commerce/productos");
  }
}


// =============== PERFIL COMERCIO ===============
export async function GetProfile(req, res, next){
  const { userId } = req.params

  if(!userId){
      req.flash("errors", "No se pudo encontrar el perfil de su comercio.");
      return res.redirect("/commerce/home");
  }

  if(userId != req.session.user.id){
      console.log(req.session.user.id)
      req.flash("errors", "Solo puedes editar su perfil.");
      return res.redirect("/commerce/home");
  }

  try{
    const commerceResult = await context.UsersModel.findOne({
      where: {id: userId}, 
      include: [{model: context.CommercesModel,
      as: "Commerce"}]});

      if(!commerceResult){
          req.flash("errors", "No se pudieron encontrar los datos de su comercio.");
          return res.redirect("/commerce/home");
      }

      const commerce = commerceResult.get({plain: true});

      return res.render("commerce/profile", {
          commerce: commerce,
          "page-title": `Web Library - Mi Perfil ${commerce.profileName}`, layout: "commerce-layout"
      });

  }catch(err){
      console.log(`Error while fetching profile: ${err}`)
      req.flash("errors", "Ha ocurrido un error llamando los datos de su usuario.")
      res.redirect("/commerce/home")
  }
}

export async function PostProfile(req, res, next) {
  const { commerceEmail, commercePhoneNumber,commerceOpeningHour, commerceClosingHour,
   commerceId } = req.body;

   const imageURL = req.file;
   let imagePath = null


   if(!commerceId){
      req.flash("errors", "Ha ocurrido un error editando la información de su usuario.");
      return res.redirect("/commerce/profile");
   }

   if(commerceId != req.session.user.id){
      req.flash("errors", "Solo puedes alterar tu usuario.");
      return res.redirect("/commerce/profile");
   }

   try{
        const otherUser = await context.UsersModel.findOne({
          where: {
            email: commerceEmail,
            id: { [Op.ne]: commerceId }
        },
        include: [{
            model: context.CommercesModel,
            as: "Commerce"
        }]
    });

      if(otherUser){
          req.flash("errors", "Ya existe otro usuario con ese email.");
          return res.redirect("/commerce/profile");
      }

      const user = await context.UsersModel.findOne({
        where: {
            id: commerceId
            }, include: [{
              model: context.CommercesModel,
              as: "Commerce"
          }]});

      if(imageURL){
          imagePath = path.join(projectRoot, "public", user.imageUrl);
          if(fs.existsSync(imagePath)){
              fs.unlinkSync(imagePath);
          };

          imagePath = "\\" + path.relative("public", imageURL.path);
      }else{
          imagePath = user.dataValues.imageURL
      }

      const transaction = await Sequelize.transaction();
      try{
        await context.UsersModel.update({
          email: commerceEmail,
          phoneNumber: commercePhoneNumber,
          imageUrl: imagePath,
      }, {where: {id: commerceId}}, {transaction: transaction});

      await context.CommercesModel.update({
        openingHour: commerceOpeningHour,
        closingHour: commerceClosingHour,
    }, {where: {userId: commerceId}}, {transaction: transaction});

    await transaction.commit();

    req.flash("success", "Se ha editado el perfil con éxito.")
    return res.redirect(`/commerce/profile/${commerceId}`);

    }catch(err){
      transaction.rollback();
      console.log(`Error while saving profile: ${err}`)
      req.flash("errors", "Ha ocurrido un error guardando los cambios del perfil.")
      res.redirect("/commerce/home")
    }


   }catch(err){
      console.log(`Error while editing profile: ${err}`)
      req.flash("errors", "Ha ocurrido un error guardando los cambios del perfil.")
      res.redirect("/commerce/home")
   }
}