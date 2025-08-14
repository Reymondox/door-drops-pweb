export default function isAuthForLogin(req, res, next){
    if(req.session.isAuthenticated){
       return res.redirect("/home/index");
    }
    return next();
   }