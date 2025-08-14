export default function isAuthForAdmin(req, res, next){
    if(req.session.isAuthenticated && req.session.user.role !== 'client'){
       req.flash("errors", "No tiene privilegios para acceder a esta página.");
       return res.redirect("/home/index");
    }
    return next();
   }