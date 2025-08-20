import ctx from '../../context/AppContext.js';

export default {
  async index(req, res) {
    const typesObj = await ctx.CommerceTypesModel.findAll({ order: [['name','ASC']] });

    const types = typesObj.map((type) => type.get({plain: true}));
    res.render('client/home', {
      layout: 'client-layout',
      'page-title': 'Home',
      types,
      hasUser: !!req.session.user,
      user: req.session.user
    });
  }
};
