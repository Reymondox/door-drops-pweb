export default function isAuth(req, res, next){
    if(req.session.isAuthenticated && req.session.user){
       return next()
    }
    req.flash("errors", "Debes haber iniciado sesión para acceder a esta página.");
    res.redirect("/");
   }