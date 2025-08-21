// controllers/client/ProfileController.js
import ctx from '../../context/AppContext.js';

export default {
  async view(req, res) {
    const me = await ctx.UsersModel.findByPk(req.session.user.id, {
      attributes: ['id', 'name', 'lastName', 'phoneNumber', 'email', 'imageUrl', 'profileName']
    });

    if (!me) {
      req.flash('errors', 'No se pudo cargar tu perfil.');
      return res.redirect('/client/home');
    }

    res.render('client/profile', {
      layout: 'client-layout',
      'page-title': 'Mi perfil',
      me: me.get({ plain: true }),
      hasUser: true,
      user: req.session.user
    });
  },

  async update(req, res) {
    try {
      const { name, lastName, phoneNumber } = req.body;

      const updates = {
        name: name ?? null,
        lastName: lastName ?? null,
        phoneNumber: phoneNumber ?? null
      };

      if (req.file) {
        updates.imageUrl = `/assets/images/user-photos/${req.file.filename}`;
      }

      await ctx.UsersModel.update(updates, { where: { id: req.session.user.id } });

      if (req.session.user) {
        if (updates.name !== undefined) req.session.user.name = updates.name;
        if (updates.lastName !== undefined) req.session.user.lastName = updates.lastName;
        if (updates.phoneNumber !== undefined) req.session.user.phoneNumber = updates.phoneNumber;
        if (updates.imageUrl) req.session.user.imageUrl = updates.imageUrl;
      }

      req.flash('success', 'Perfil actualizado correctamente.');
      return res.redirect('/client/profile');
    } catch (err) {
      console.error('Profile update error:', err);
      req.flash('errors', 'No se pudo actualizar el perfil.');
      return res.redirect('/client/profile');
    }
  }
};
