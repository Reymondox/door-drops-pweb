import ctx from '../../context/AppContext.js';

export default {
  async index(req, res) {
    const types = await ctx.CommerceTypesModel.findAll({ order: [['name','ASC']] });
    res.render('client/home', {
      layout: 'client-layout',
      'page-title': 'Home',
      types,
      hasUser: !!req.session.user,
      user: req.session.user
    });
  }
};
