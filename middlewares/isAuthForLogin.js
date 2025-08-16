export default function isAuthForLogin(req, res, next){
    if(req.session.isAuthenticated){
       return res.redirect("/commerce/home");
    }
    return next();
   }