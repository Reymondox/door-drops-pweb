import ctx from '../../context/AppContext.js';

export default {
  async list(req, res) {
    const items = await ctx.UserAddressModel.findAll({
      where: { userId: req.session.user.id }, order: [['name','ASC']]
    });
    res.render('client/addresses', {
      layout: 'client-layout',
      'page-title': 'Mis direcciones',
      items, hasUser: true, user: req.session.user
    });
  },
  newForm(req, res) {
    res.render('client/addresses-create', { layout: '/client-layout', 'page-title': 'Nueva dirección', hasUser: true, user: req.session.user });
  },
  async create(req, res) {
    const { name, address } = req.body;
    await ctx.UserAddressModel.create({ userId: req.session.user.id, name, address });
    res.redirect('/client/addresses');
  },
  async editForm(req, res) {
    const item = await ctx.UserAddressModel.findOne({ where: { id: req.params.id, userId: req.session.user.id }});
    if (!item) return res.redirect('/client/addresses');
    res.render('client/addresses-edit', { layout: '/client-layout', 'page-title': 'Editar dirección', item, hasUser: true, user: req.session.user });
  },
  async update(req, res) {
    const { name, address } = req.body;
    await ctx.UserAddressModel.update({ name, address }, { where: { id: req.params.id, userId: req.session.user.id }});
    res.redirect('/client/addresses');
  },
  async remove(req, res) {
    await ctx.UserAddressModel.destroy({ where: { id: req.params.id, userId: req.session.user.id }});
    res.redirect('/client/addresses');
  }
};
