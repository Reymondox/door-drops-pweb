import ctx from '../../context/AppContext.js';

function ensureCart(session, commerceId) {
  if (!session.cart) session.cart = { commerceId, items: [], subtotal: 0 };
  if (session.cart.commerceId && session.cart.commerceId !== commerceId) {
    // Reinicia si cambia de comercio
    session.cart = { commerceId, items: [], subtotal: 0 };
  }
}

export default {
  view(req, res) {
    res.render('client/cart', {
      layout: 'client-layout',
      'page-title': 'Mi pedido',
      cart: req.session.cart || { commerceId: null, items: [], subtotal: 0 },
      hasUser: true, user: req.session.user
    });
  },

  async add(req, res) {
    const { productId, commerceId } = req.body;
    ensureCart(req.session, Number(commerceId));

    // Evita duplicados (solo 1 por producto, como exige el enunciado)
    if (req.session.cart.items.find(i => i.productId === Number(productId))) {
      return res.redirect('back');
    }
    const p = await ctx.ProductsModel.findByPk(productId, { attributes: ['id','name','price'] });
    req.session.cart.items.push({ productId: p.id, name: p.name, price: p.price });
    req.session.cart.subtotal = req.session.cart.items.reduce((s,i)=>s+i.price,0);
    res.redirect('back');
  },

  remove(req, res) {
    const { productId } = req.body;
    if (!req.session.cart) return res.redirect('back');
    req.session.cart.items = req.session.cart.items.filter(i => i.productId !== Number(productId));
    req.session.cart.subtotal = req.session.cart.items.reduce((s,i)=>s+i.price,0);
    res.redirect('back');
  }
};
