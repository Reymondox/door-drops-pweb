export default function isAuthForAdmin(req, res, next){
    if(req.session.isAuthenticated && req.session.user.role !== 'delivery'){
       req.flash("errors", "No tiene privilegios para acceder a esta página.");
       return res.redirect("/");
    }

    if(!req.session.isAuthenticated && !req.session.user){
      req.flash("errors", "Debes haber iniciado sesión para acceder a esta página.");
      return res.redirect("/");
   }

    return next();
   }