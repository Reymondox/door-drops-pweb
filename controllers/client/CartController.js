// controllers/client/CartController.js
import ctx from '../../context/AppContext.js';

/**
 * Estructura del carrito en sesión:
 * req.session.cart = {
 *   commerceId: number,
 *   items: [{ productId, name, price }],
 *   subtotal: number
 * }
 */

function ensureCart(session, commerceId) {
  if (!session.cart) {
    session.cart = { commerceId, items: [], subtotal: 0 };
    return;
  }
  
// Si el carrito existe pero NO tiene comercio aún, asígnalo
  if (session.cart.commerceId == null) {
    session.cart.commerceId = commerceId;
  }

  // Si cambia de comercio, reinicia (un carrito por comercio)
  if (session.cart.commerceId !== commerceId && session.cart.items.length > 0) {
    session.cart = { commerceId, items: [], subtotal: 0 };
  }

  // Si cambia de comercio, reinicia carrito (enunciado: un carrito por comercio)
  // if (session.cart.commerceId && session.cart.commerceId !== commerceId) {
  //   session.cart = { commerceId, items: [], subtotal: 0 };
  // }
}

function recalc(cart) {
  cart.subtotal = cart.items.reduce((s, i) => s + Number(i.price || 0), 0);
}

function safeRedirect(req, fallback) {
  // 1) returnUrl oculto del form (validamos que sea path interno)
  const ru = req.body?.returnUrl;
  if (typeof ru === 'string' && ru.startsWith('/')) return ru;

  // 2) Referer
  const ref = req.get('Referer');
  if (ref) {
    try {
      const url = new URL(ref);
      return url.pathname + url.search; // solo path + query
    } catch { /* ignore */ }
  }
  // 3) Fallback
  return fallback;
}

export default {
  // GET /client/cart
  view(req, res) {
    res.render('client/cart', {
      layout: 'client-layout',
      'page-title': 'Mi pedido',
      cart: req.session.cart || { commerceId: null, items: [], subtotal: 0 },
      hasUser: true,
      user: req.session.user
    });
  },

  // POST /client/cart/add
  async add(req, res) {
    try {
      const pid = parseInt(req.body.productId, 10);
      const cid = parseInt(req.body.commerceId, 10);

      if (Number.isNaN(pid) || Number.isNaN(cid)) {
        req.flash('errors', 'Producto inválido.');
        return res.redirect(safeRedirect(req, '/client/commerces'));
      }

      ensureCart(req.session, cid);

      // Evitar duplicados: solo 1 por producto (según enunciado)
      if (req.session.cart.items.some(i => i.productId === pid)) {
        return res.redirect(safeRedirect(req, `/client/commerces/${cid}`));
      }

      // Verifica que el producto exista y pertenezca a ese comercio
      const p = await ctx.ProductsModel.findOne({
        where: { id: pid, commerceId: cid },
        attributes: ['id', 'name', 'price']
      });

      if (!p) {
        req.flash('errors', 'El producto no existe o no pertenece a este comercio.');
        return res.redirect(safeRedirect(req, `/client/commerces/${cid}`));
      }

      req.session.cart.items.push({
        productId: p.id,
        name: p.name,
        price: Number(p.price)
      });

      recalc(req.session.cart);

      return res.redirect(safeRedirect(req, `/client/commerces/${cid}`));
    } catch (err) {
      console.error('Cart add error:', err);
      req.flash('errors', 'No se pudo agregar el producto.');
      return res.redirect('/client/commerces');
    }
  },

  // POST /client/cart/remove
  remove(req, res) {
    const pid = parseInt(req.body.productId, 10);
    const cid = parseInt(req.body.commerceId, 10);
    const fallback = Number.isNaN(cid) ? '/client/commerces' : `/client/commerces/${cid}`;

    if (!req.session.cart || Number.isNaN(pid)) {
      return res.redirect(safeRedirect(req, fallback));
    }

    req.session.cart.items = req.session.cart.items.filter(i => i.productId !== pid);
    recalc(req.session.cart);

    return res.redirect(safeRedirect(req, fallback));
  }
};
