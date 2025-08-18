import { Op } from 'sequelize';
import ctx from '../../context/AppContext.js';

export default {
  async list(req, res) {
    const { type, search } = req.query;
    const where = {};
    if (type) where.commerceTypeId = type;
    if (search) where['$User.profileName$'] = { [Op.like]: `%${search}%` };

    const { rows, count } = await ctx.CommercesModel.findAndCountAll({
      where,
      include: [{ model: ctx.UsersModel, attributes: ['profileName','imageUrl','id'] }],
      order: [[ctx.UsersModel, 'profileName', 'ASC']]
    });

    // favoritos del usuario
    const favs = await ctx.UserFavoritesModel.findAll({
      where: { userId: req.session.user.id },
      attributes: ['commerceId']
    });
    const favSet = new Set(favs.map(f=>f.commerceId));

    res.render('client/commerces-list', {
      layout: 'client-layout',
      'page-title': 'Comercios',
      items: rows.map(c => ({
        id: c.id,
        name: c.User.profileName,
        logo: c.User.imageUrl,
        isFav: favSet.has(c.id)
      })),
      count,
      type,
      search,
      hasUser: true,
      user: req.session.user
    });
  },

  async catalog(req, res) {
    const { commerceId } = req.params;
    // categorías + productos del comercio
    const categories = await ctx.CategoriesModel.findAll({
      where: { commerceId },
      include: [{ model: ctx.ProductsModel, order: [['name', 'ASC']] }],
      order: [['name','ASC']]
    });

    // carrito en sesión
    const cart = req.session.cart || { commerceId: null, items: [], subtotal: 0 };

    res.render('client/catalog', {
      layout: 'layouts/client-layout',
      'page-title': 'Catálogo',
      categories,
      commerceId,
      cart,
      hasUser: true,
      user: req.session.user
    });
  }
};
