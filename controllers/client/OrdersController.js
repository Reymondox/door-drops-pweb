import ctx from '../../context/AppContext.js';

export default {
  async list(req, res) {
    const orders = await ctx.OrdersModel.findAll({
      where: { userId: req.session.user.id },
      include: [
        { model: ctx.CommercesModel, include: [{ model: ctx.UsersModel, attributes: ['profileName','imageUrl'] }] },
        { model: ctx.OrdersProductsModel, include: [{ model: ctx.ProductsModel, attributes: ['id'] }] }
      ],
      order: [['orderedAt','DESC']]
    });

    res.render('client/orders', {
      layout: 'client-layout',
      'page-title': 'Mis pedidos',
      orders,
      hasUser: true, user: req.session.user
    });
  },

  async detail(req, res) {
    const { orderId } = req.params;
    const order = await ctx.OrdersModel.findOne({
      where: { id: orderId, userId: req.session.user.id },
      include: [
        { model: ctx.CommercesModel, include: [{ model: ctx.UsersModel, attributes: ['profileName','imageUrl'] }] },
        { model: ctx.OrdersProductsModel, include: [{ model: ctx.ProductsModel, attributes: ['name','price','imageUrl'] }] }
      ]
    });
    if (!order) return res.redirect('/client/orders');

    res.render('client/order-detail', {
      layout: 'layouts/client-layout',
      'page-title': 'Detalle de pedido',
      order,
      hasUser: true, user: req.session.user
    });
  }
};
