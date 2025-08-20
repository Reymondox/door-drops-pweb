import ctx from '../../context/AppContext.js';

export default {
  async view(req, res) {
    const me = await ctx.UsersModel.findByPk(req.session.user.id);
    res.render('client/profile', { layout: 'client-layout', 'page-title': 'Mi perfil', me, hasUser: true, user: req.session.user });
  },
  async update(req, res) {
    const { name, lastName, phoneNumber } = req.body;
    // (imagen vía multer si decides permitirla)
    await ctx.UsersModel.update({ name, lastName, phoneNumber }, { where: { id: req.session.user.id }});
    res.redirect('/client/profile');
  }
};
