// import { where } from 'sequelize';
// import context from '../context/AppContext.js'

// export function GetCommerce(req, res, next){
//         res.render("commerce/home",
//             {"page-title": "Door Drops - Commerce", layout: "commerce-layout" }
//         )
// }

// export async function GetCommerceHome(req, res, next) {
//   try {
//     const userResult = await context.UsersModel.findOne({where: {id: req.session.user.id}});
//     const commerceResult = await context.CommercesModel.findOne({where: {userId: req.session.user.id}});
//     const user = userResult.get({plain: true});

//     if(!commerceResult){
//         req.flash("erros", "No se ha encontrado la información de este comercio para mostrar los pedidos.")
//         return res.redirect("/commerce/home")
//     }

//     const ordersResult = await context.OrdersModel.findAll({
//     attributes: [
//         'id', 'totalPrice', 'status', 'orderedAt',
//         [context.OrdersProductsModel.sequelize.fn('COUNT', context.OrdersProductsModel.sequelize.col('OrdersProducts.id')), 'totalProducts']
//     ],
//     where: { commerceId: commerceResult.id },
//     include: [
          
//         {
//             model: context.OrdersProductsModel,
//             as: "OrdersProducts",
//             attributes: []
//         }
//     ],
//     group: ['Orders.id'], 
//     raw: true, 
// });

//     // 3. Renderizar la vista
//     res.render('commerce/home', {
//       pageTitle: 'Home del Comercio',
//       ordersList: ordersResult,
//       commerce: user,
//       layout: 'commerce-layout'
//     });

//   } catch (err) {
//     console.error('Error cargando home del comercio:', err);
//     res.status(500).render('errors/500', { error: 'Error cargando pedidos' });
//   }
// }

// export async function GetOrderDetail(req, res, next) {
//   const { orderId } = req.params;
//   try {
//     const commerceResult = await context.CommercesModel.findOne({where: {userId: req.session.user.id}});
//     const order = await context.OrdersModel.findOne({
//         where: { id: orderId, commerceId: commerceResult.id},
//         include: [
//             {
//                 model: context.OrdersProductsModel,
//                 as: "OrdersProducts",
//                 attributes: [], 
//                 include: [{
//                     model: context.ProductsModel,
//                     as: "Product",
//                     attributes: ['name', 'imageUrl', 'price']
//                 }]
//               }
//            ]
//        });
      
//       const check = order.get({ plain: true })
//       console.log(check);
//     if (!order) {
//       return res.redirect('/commerce/home'); 
//     }

//     res.render('commerce/order-detail', {
//       pageTitle: `Detalle Pedido #${order.id}`,
      
//       layout: 'commerce-layout'
//     });

//   } catch (err) {
//     console.error('Error cargando detalle del pedido:', err);
//     res.status(500).render('errors/500', { error: 'Error cargando detalle del pedido' });
//   }
// }


// // ------------------------------
// // Asignar delivery a pedido pendiente
// // ------------------------------
// export async function PostAssignDelivery(req, res, next) {
//   const { orderId } = req.body;

//   try {
//     const order = await context.OrdersModel.findByPk(orderId);
//     if (!order || order.status !== 'PENDING') 
//       return res.redirect(`/commerce/orders/${orderId}`);

//     const availableDelivery = await context.DeliveriesModel.findOne({ where: { status: 'FREE' } });
//     if (!availableDelivery) {
//       req.flash('errors', 'No hay delivery disponible en este momento. Intente más tarde.');
//       return res.redirect(`/commerce/orders/${orderId}`);
//     }

//     order.deliveryId = availableDelivery.id;
//     order.status = 'IN_PROCESS';
//     await order.save();

//     availableDelivery.status = 'OCCUPIED';
//     await availableDelivery.save();

//     req.flash('success', 'Delivery asignado y pedido en proceso.');
//     res.redirect(`/commerce/orders/${orderId}`);

//   } catch (err) {
//     console.error('Error asignando delivery:', err);
//     res.status(500).render('errors/500', { error: 'Error asignando delivery' });
//   }
// }



// //Mantenimiento categoria

// export async function GetIndex(req, res, next) {
  
//   try {
    
//     const commerceResult = await context.UsersModel.findOne({where: {id: req.session.user.id}, 
//     include: [{ model: context.CommercesModel, as: "Commerce" }]})

//     if(!commerceResult){
//         req.flash("errors", "No se encontró el comercio al que pertenecerá la categoría");
//         res.redirect("/commerce/create")
//     }

//     const result = await context.CategoriesModel.findAll({
//       where: {commerceId: commerceResult.Commerce.id},
//       include: [{ model: context.ProductsModel }], 
//     });
    
//     const categorias = result.map((r) => {
//       const categoria = r.get({ plain: true });
//       // Aquí usamos el nombre correcto del array devuelto
//       categoria.productosCount = categoria.Products ? categoria.Products.length : 0;
//       return categoria;
//     });

//     res.render("commerce/categorias", {
//       categoriasList: categorias,
//       hasCategorias: categorias.length > 0,
//       pageTitle: "Mantenimiento de Categorías", 
//       layout: "commerce-layout"
//     });
//   } catch (err) {
//     console.error("Error fetching categorias:", err);
//     res.status(500).render("errors/500", { error: "Error cargando categorías" });
//   }
// }

// export async function GetCreate(req, res, next) {
//   try {
//     res.render("commerce/save-categorias", {
//       editMode: false,
//       "page-title": "Nueva Categoría", layout: "commerce-layout"
//     });
//   } catch (err) {
//     console.error("Error cargando formulario:", err);
//   }
// }

// export async function PostCreate(req, res, next) {
//   const { name, description } = req.body;

//   try {
//     if (!name || !description) {
//       return res.render("commerce/save-categorias", {
//         editMode: false,
//         error: "Todos los campos son requeridos",
//         "page-title": "Nueva Categoría", layout: "commerce-layout"
//       });
//     } 

//     const result = await context.UsersModel.findOne({where: {id: req.session.user.id}, 
//     include: [{ model: context.CommercesModel, as: "Commerce" }]})

//     if(!result){
//         req.flash("errors", "No se encontró el comercio al que pertenecerá la categoría");
//         res.redirect("/commerce/create")
//     }

//     await context.CategoriesModel.create({ name: name, description: description, commerceId: result.Commerce.id });
//     return res.redirect("/commerce/categorias");
//   } catch (err) {
//     console.error("Error creando categoria:", err);
//     res.status(500).render("errors/500", { error: "Error creando categoría" });
//   }
// }

// export async function GetEdit(req, res, next) {
//   const id = req.params.categoriasId;

//   try {
//     const categoriaResult = await context.CategoriesModel.findOne({ where: { id: id } });

//     if (!categoriaResult) {
//       return res.redirect("commerce/categorias");
//     }

//     const categoria = categoriaResult.get({ plain: true });

//     res.render("commerce/save-categorias", {
//       editMode: true,
//       categoria,
//       "page-title": `Editar Categoría: ${categoria.name}`, layout: "commerce-layout"
//     });
//   } catch (err) {
//     console.error("Error cargando categoria para editar:", err);
//     res.status(500).render("errors/500", { error: "Error cargando categoría" });
//   }
// }

// export async function PostEdit(req, res, next) {
//   const { name, description, categoriasId } = req.body;

//   try {
//     if (!name || !description) {
//       return res.render("commerce/save-categorias", {
//         editMode: true,
//         error: "Todos los campos son requeridos",
//         categoria: { id: categoriasId, name, description },
//         "page-title": "Editar Categoría", layout: "commerce-layout"
//       });
//     }

//     await context.CategoriesModel.update(
//       { name, description },
//       { where: { id: categoriasId } }
//     );

//     return res.redirect("/commerce/categorias");
//   } catch (err) {
//     console.error("Error actualizando categoria:", err);
//     res.status(500).render("errors/500", { error: "Error actualizando categoría" });
//   }
// }

// export async function GetDelete(req, res, next) {
//   const id = req.params.categoriasId;

//   try {
//     const categoria = await context.CategoriesModel.findOne({ where: { id } });

//     if (!categoria) {
//       return res.redirect("/commerce/categorias");
//     }

//     res.render("commerce/save-categorias", {
//       categoria: categoria.get({ plain: true }),
//       "page-title": `Eliminar Categoría: ${categoria.name}`, layout: "commerce-layout"
//     });
//   } catch (err) {
//     console.error("Error cargando categoria para eliminar:", err);
//     res.status(500).render("errors/500", { error: "Error cargando categoría" });
//   }
// }


// export async function PostDelete(req, res, next) {
//   const { categoriasId } = req.body;

//   try {
//     await context.CategoriesModel.destroy({ where: { id: categoriasId } });
//     return res.redirect("/commerce/categorias");
//   } catch (err) {
//     console.error("Error eliminando categoria:", err);
//     res.status(500).render("errors/500", { error: "Error eliminando categoría" });
//   }
// }

// //Mantenimiento Productos 

// export async function GetProducts(req, res) {
//   try {

//     const result = await context.UsersModel.findOne({where: {id: req.session.user.id}, 
//     include: [{ model: context.CommercesModel, as: "Commerce" }]})

//      if(!result){
//         req.flash("errors", "No se encontró el comercio al que pertenece el producto");
//         res.redirect("/")
//     }
  
//     const productos = await context.ProductsModel.findAll({
//       where: {commerceId: result.Commerce.id},
//       include: [{ model: context.CategoriesModel}]
//     });
    

    
//     res.render("commerce/productos", {
//       pageTitle: "Mantenimiento de Productos",
//       productosList: productos.map(p => p.get({ plain: true })),
//       hasProductos: productos.length > 0,
//       layout: "commerce-layout"
//     });
//   } catch (err) {
//     console.error("Error cargando productos:", err);
//     res.status(500).render("errors/500", { error: "Error cargando productos" });
//   }
// }

// export async function GetCreateProduct(req, res) {
  
//   try {
    
//     const result = await context.UsersModel.findOne({where: {id: req.session.user.id}, 
//     include: [{ model: context.CommercesModel, as: "Commerce" }]})

//     if(!result){
//         req.flash("errors", "No se encontró el comercio al que pertenecerá la categoría");
//         res.redirect("/commerce/create")
//     }

//     const categorias = await context.CategoriesModel.findAll({where: {
//       commerceId: result.Commerce.id
//     }});

//     res.render("commerce/save-productos", {
//       pageTitle: "Crear Producto",
//       categoriasList: categorias.map(c => c.get({ plain: true })),
//       editMode: false,
//       layout: "commerce-layout"
//     });
//   } catch (err) {
//     console.error("Error cargando formulario de creación:", err);
//     res.status(500).render("errors/500", { error: "Error cargando formulario" });
//   }
// }

// export async function PostCreateProduct(req, res) {
//   const { name, description, price, categorieId } = req.body;
//   const imageUrl = req.file ? "/assets/images/product-photos/" + req.file.filename : null;

//   try {
    
//     const result = await context.UsersModel.findOne({where: {id: req.session.user.id}, 
//     include: [{ model: context.CommercesModel, as: "Commerce" }]})

//     if(!result){
//         req.flash("errors", "No se encontró el comercio al que pertenecerá la categoría");
//         res.redirect("/commerce/create")
//     }

//     await context.ProductsModel.create({
//       name: name,
//       description: description,
//       price: price,
//       categorieId: categorieId,
//       imageUrl: imageUrl,
//       commerceId: result.Commerce.id
//     });
//     res.redirect("/commerce/productos");
//   } catch (err) {
//     console.error("Error creando producto:", err);
//     res.status(500).render("errors/500", { error: "Error creando producto" });
//   }
// }

// export async function GetEditProduct(req, res) {
//   const id = req.params.productId;

//   const commerceResult = await context.UsersModel.findOne({where: {id: req.session.user.id}, 
//     include: [{ model: context.CommercesModel, as: "Commerce" }]})

//     if(!commerceResult){
//         req.flash("errors", "No se encontró el comercio al que pertenecerá la categoría");
//         res.redirect("/commerce/create")
//     }

//   try {
//     const producto = await context.ProductsModel.findOne({
//       where: {id: id}
//     })
//     const categorias = await context.CategoriesModel.findAll({
//       where: {commerceId: commerceResult.Commerce.id}
//     });

//     if (!producto) return res.redirect("/commerce/productos");

//     res.render("commerce/save-productos", {
//       pageTitle: "Editar Producto",
//       producto: producto.get({plain: true}),
//       categoriasList: categorias.map(c => c.get({ plain: true })),
//       editMode: true,
//       layout: "commerce-layout"
//     });
//   } catch (err) {
//     console.error("Error cargando producto para editar:", err);
//     res.status(500).render("errors/500", { error: "Error cargando producto" });
//   }
// }

// export async function PostEditProduct(req, res) {
//   const { productId, name, description, price, categorieId } = req.body;
//   const imageUrl = req.file ? "/assets/images/product-photos/" + req.file.filename : null;

//   try {
//     const producto = await context.ProductsModel.findByPk(productId);
//     if (!producto) return res.redirect("/commerce/productos");

//     producto.name = name;
//     producto.description = description;
//     producto.price = price;
//     producto.categorieId = categorieId;
//     if (imageUrl) producto.imageUrl = imageUrl;

//     await producto.save();
//     res.redirect("/commerce/productos");
//   } catch (err) {
//     console.error("Error editando producto:", err);
//     res.status(500).render("errors/500", { error: "Error editando producto" });
//   }
// }

// export async function GetDeleteProduct(req, res) {
//   const id = req.params.productId;

//   try {
    
//     const producto = await context.ProductsModel.findByPk(id);
//     if (!producto) return res.redirect("/commerce/productos");

//     res.render("commerce/save-productos", {
//       pageTitle: "Eliminar Producto",
//       producto: producto.get({ plain: true }),
//       layout: "commerce-layout"
//     });
//   } catch (err) {
//     console.error("Error cargando producto para eliminar:", err);
//     res.status(500).render("errors/500", { error: "Error cargando producto" });
//   }
// }

// export async function PostDeleteProduct(req, res) {
//   const { productId } = req.body;

//   try {
//     await context.ProductsModel.destroy({ where: { id: productId } });
//     res.redirect("/commerce/productos");
//   } catch (err) {
//     console.error("Error eliminando producto:", err);
//     res.status(500).render("errors/500", { error: "Error eliminando producto" });
//   }
// }








import context from '../context/AppContext.js';
const { Sequelize } = context; // para transacciones

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
    // Dueño (usuario logueado) y su comercio
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

    // Pedidos de este comercio + total de productos
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

    // Para el layout (imagen/nombre a la izquierda) usamos el perfil del dueño
    const mapped = orders.map(o => ({
      orderId: o.orderId,
      status: o.status,                          // PENDING | IN_PROCESS | COMPLETED
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

    console.log(commerce)

    if (!commerce) {
      req.flash("errors", "No se ha encontrado tu información de comercio para los pedidos.");
      return res.redirect("/");
    }

    const userObj = await context.UsersModel.findOne({
      where: { id: req.session.user.id }
    });

    const user = userObj.get({plain: true});

    console.log(user)

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
          // OJO: tu OrdersProducts no tiene quantity ni price
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
        quantity: 1, // tu modelo no tiene quantity; asumimos 1
        lineTotal: toMoney(unitPrice) // 1 * unitPrice
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

  // Log rápido para diagnosticar
  console.log('assign-delivery payload →', {
    body: req.body,
    params: req.params,
    query: req.query
  });

  if (!orderId) {
    req.flash("errors", "Se necesita un id de orden para asignar un delivery.");
    return res.redirect("/commerce/home");
  }

  // Usa la misma conexión/ORM que tus modelos:
  const sequelize = context.OrdersModel.sequelize;
  const transaction = await sequelize.transaction();

  try {
    // 1) Comercio del usuario actual
    const commerce = await context.CommercesModel.findOne({
      where: { userId: req.session.user.id },
      transaction
    });

    if (!commerce) {
      await transaction.rollback();
      req.flash("errors", "No se encontró tu información de comercio para asignar delivery.");
      return res.redirect("/commerce/home");
    }

    // 2) Orden pendiente del comercio
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

    // 3) Buscar un delivery libre
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

    // 4) Actualizar estado de la orden y del delivery
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
    // Redirige al detalle con tu ruta actual
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
export async function GetProfile(req, res, next) {
  try {
    // Dueño + comercio + lista de tipos para mostrar nombres
    const owner = await context.UsersModel.findOne({
      where: { id: req.session.user.id },
      include: [{ model: context.CommercesModel, as: "Commerce" }]
    });

    if (!owner || !owner.Commerce) {
      req.flash("errors", "No se encontró información de tu comercio.");
      return res.redirect("/commerce/home");
    }

    const types = await context.CommerceTypesModel.findAll({ raw: true });

    return res.render("commerce/profile", {
      pageTitle: "Perfil del Comercio",
      layout: "commerce-layout",
      owner: owner.get({ plain: true }),          // Users
      commerce: owner.Commerce.get({ plain: true }), // Commerces
      commerceTypes: types
    });
  } catch (err) {
    console.error("Error cargando perfil de comercio:", err);
    req.flash("errors", "Ha ocurrido un error cargando el perfil del comercio.");
    return res.redirect("/commerce/home");
  }
}

export async function GetEditProfile(req, res, next) {
  try {
    const owner = await context.UsersModel.findOne({
      where: { id: req.session.user.id },
      include: [{ model: context.CommercesModel, as: "Commerce" }]
    });

    if (!owner || !owner.Commerce) {
      req.flash("errors", "No se encontró información de tu comercio para editar.");
      return res.redirect("/commerce/home");
    }

    const types = await context.CommerceTypesModel.findAll({ raw: true });

    return res.render("commerce/save-profile", {
      pageTitle: "Editar Perfil del Comercio",
      layout: "commerce-layout",
      owner: owner.get({ plain: true }),
      commerce: owner.Commerce.get({ plain: true }),
      commerceTypes: types,
      editMode: true
    });
  } catch (err) {
    console.error("Error cargando formulario de perfil:", err);
    req.flash("errors", "Ha ocurrido un error cargando el formulario de perfil.");
    return res.redirect("/commerce/profile");
  }
}

export async function PostEditProfile(req, res, next) {
  // Campos que vendrán del form
  const { profileName, phoneNumber, email, commerceTypeId, openingHour, closingHour } = req.body;
  // Imagen/logo opcional (usa multer en la ruta)
  const newImageUrl = req.file ? "/assets/images/merchant-logos/" + req.file.filename : null;

  // Transacción para actualizar Users + Commerces
  const sequelize = context.UsersModel.sequelize;
  const t = await sequelize.transaction();

  try {
    const owner = await context.UsersModel.findOne({
      where: { id: req.session.user.id },
      include: [{ model: context.CommercesModel, as: "Commerce" }],
      transaction: t
    });

    if (!owner || !owner.Commerce) {
      await t.rollback();
      req.flash("errors", "No se encontró tu comercio para actualizar.");
      return res.redirect("/commerce/home");
    }

    // Validaciones mínimas (puedes ampliarlas)
    if (!profileName || !phoneNumber || !email || !commerceTypeId || !openingHour || !closingHour) {
      await t.rollback();
      req.flash("errors", "Todos los campos son requeridos.");
      return res.redirect("/commerce/profile/edit");
    }

    // Update Users
    owner.profileName = profileName;
    owner.phoneNumber = phoneNumber;
    owner.email = email;
    if (newImageUrl) owner.imageUrl = newImageUrl;
    await owner.save({ transaction: t });

    // Update Commerces
    owner.Commerce.commerceTypeId = commerceTypeId;
    owner.Commerce.openingHour = openingHour;
    owner.Commerce.closingHour = closingHour;
    await owner.Commerce.save({ transaction: t });

    await t.commit();
    req.flash("success", "Perfil del comercio actualizado correctamente.");
    return res.redirect("/commerce/profile");
  } catch (err) {
    await (t?.rollback?.());
    console.error("Error actualizando perfil del comercio:", err);
    req.flash("errors", "Ha ocurrido un error actualizando el perfil del comercio.");
    return res.redirect("/commerce/profile/edit");
  }
}
