// export default function isAuthForLogin(req, res, next){
//     if(req.session.isAuthenticated && req.session.user){
//       switch(req.session.user.role){
//          case "client":
//             return res.redirect("/client/home");
//          case "delivery":
//             return res.redirect("/delivery/home");
//          case "commerce":
//             return res.redirect("/commerce/home");
//          case "admin":
//             return res.redirect("/admin/home");
//       }
//     if(req.session.isAuthenticated){
//        return res.redirect("/commerce/home");
//     }

//     return next();
//    }
// }

export default function isAuthForLogin(req, res, next){
    if(req.session.isAuthenticated && req.session.user){
      switch(req.session.user.role){
         case "client":
            return res.redirect("/client/home");
         case "delivery":
            return res.redirect("/delivery/home");
         case "commerce":
            return res.redirect("/commerce/home");
         case "admin":
            return res.redirect("/admin/home");
      }
    }

    return next();
   }