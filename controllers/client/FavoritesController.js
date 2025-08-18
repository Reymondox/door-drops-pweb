import ctx from '../../context/AppContext.js';

export default {
  async toggle(req, res) {
    const { commerceId } = req.params;
    const userId = req.session.user.id;

    const existing = await ctx.UserFavoritesModel.findOne({ where: { userId, commerceId }});
    if (existing) await existing.destroy();
    else await ctx.UserFavoritesModel.create({ userId, commerceId });

    // si vienes desde /client/favorites regresa ahí
    const referer = req.get('Referer') || '';
    if (referer.includes('/client/favorites')) return res.redirect('/client/favorites');
    return res.redirect('back');
  },

  async list(req, res) {
    const userId = req.session.user.id;

    // Trae favoritos + datos del comercio (nombre/logo desde Users)
    const favs = await ctx.UserFavoritesModel.findAll({
      where: { userId },
      include: [{
        model: ctx.CommercesModel,
        include: [{ model: ctx.UsersModel, attributes: ['profileName', 'imageUrl'] }]
      }]
    });

    const items = favs.map(f => ({
      id: f.Commerce.id,
      name: f.Commerce.User.profileName,
      logo: f.Commerce.User.imageUrl
    }));

    res.render('client/favorites', {
      layout: 'client-layout',
      'page-title': 'Mis favoritos',
      items,
      hasUser: true,
      user: req.session.user
    });
  }
};
