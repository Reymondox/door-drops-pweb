import ctx from '../../context/AppContext.js';

async function getItbis() {
  const rec = await ctx.ITBISModel.findOne({ order: [['id','ASC']] });
  return rec ? rec.percentage : 18;
}

export default {
  async view(req, res) {
    const cart = req.session.cart || { items: [] };
    if (!cart.items.length) return res.redirect('/client/home');

    const addresses = await ctx.UserAddressModel.findAll({
      where: { userId: req.session.user.id }, order: [['name','ASC']]
    });

    const itbisPercent = await getItbis();
    const itbisValue = cart.subtotal * (itbisPercent/100);
    const total = cart.subtotal + itbisValue;

    res.render('client/checkout', {
      layout: 'client-layout',
      'page-title': 'Checkout',
      addresses, cart, itbisPercent, itbisValue, total,
      hasUser: true, user: req.session.user
    });
  },

  async placeOrder(req, res) {
    const { addressId } = req.body;
    const cart = req.session.cart;
    if (!cart || !cart.items.length) return res.redirect('/client/home');

    const addr = await ctx.UserAddressModel.findByPk(addressId);
    if (!addr) return res.redirect('/client/checkout');

    const itbisPercent = await getItbis();
    const itbisValue = cart.subtotal * (itbisPercent/100);
    const total = cart.subtotal + itbisValue;

    const order = await ctx.OrdersModel.create({
      userId: req.session.user.id,
      commerceId: cart.commerceId,
      subtotal: cart.subtotal,
      itbisPercent,
      totalPrice: total,
      address: addr.address,    // el enunciado permite texto de dirección
      status: 'PENDING'
    });

    // Items
    await Promise.all(
      cart.items.map(i => ctx.OrdersProductsModel.create({
        orderId: order.id, productId: i.productId
      }))
    );

    // limpia carrito
    req.session.cart = { commerceId: null, items: [], subtotal: 0 };
    res.redirect('/client/orders');
  }
};
