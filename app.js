import './utils/LoadEnvConfig.js';
import express from 'express';
import {engine} from 'express-handlebars';
import { projectRoot } from './utils/Path.js';
import path from 'path';
import context from './context/AppContext.js';
import multer from 'multer';
import { v4 as guidV4} from 'uuid';
import flash from 'connect-flash'
import session from 'express-session'
import fs from 'fs'

//Routes Importation
import authRoutes from './routes/auth-routes.js';
import commerceRoutes from './routes/commerce-routes.js';
import adminRoutes from './routes/admin-routes.js'
import clientRoutes from './routes/client-routes.js';
import deliveryRoutes from './routes/delivery-routes.js'

//Helpers Importation
import { GetSection } from './utils/helpers/Section.js';
import { EqualsNumb } from './utils/helpers/CompareNumb.js';
import { Contains } from './utils/helpers/Contains.js';
import { HasContent } from './utils/helpers/HasContent.js';
import { SearchInList } from './utils/helpers/SearchInList.js';
import { IsActive } from './utils/helpers/IsActive.js'
import { Money } from './utils/helpers/Money.js'
import { CalcItbis } from './utils/helpers/CalcItbis.js';


const port = process.env.PORT;
const app = express();

//Render Engine
app.engine("hbs", engine({
    layoutsDir: "views/layouts",
    defaultLayout: "main-layout",
    extname: "hbs",
    helpers: {
        eq: EqualsNumb,
        contains: Contains,
        hasContent: HasContent,
        searchInList: SearchInList,
        isActive: IsActive,
        money: Money,
        section: GetSection,
        calcItbis: CalcItbis,
        

        ifeq: (a, b, options) => {
            return a === b ? options.fn(this) : options.inverse(this);
        }
    }
}));

app.set("view engine", "hbs");
app.set("views", "views");

app.use(session({secret: process.env.SESSION_SECRET || "90747" , resave: false, saveUninitialized: false}));

//Error engine setup
app.use(flash());


//User availability in the request object
app.use((req, res, next) =>{
    if(!req.session){
        return next();
    }
    if(!req.session.user){
        return next();
    }

    req.user = req.session.user
    return next();
})

//Locals variables
app.use((req, res, next) => {
    res.locals.errors = req.flash("errors");;
    res.locals.hasErrors = res.locals.errors.length > 0;

    res.locals.success = req.flash("success");
    res.locals.hasSuccess = res.locals.success.length > 0;

    res.locals.user = req.user;
    res.locals.hasUser = !!req.user;
    res.locals.isAuthenticated = req.session.isAuthenticated || false;
    
    return next();
});


//File Uploads Setup
const imageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const imageType = req.body.imageType;
        let uploadPath = '';

        switch(imageType){
            case "userImg":
                uploadPath = path.join(projectRoot, "public", "assets", "images", "user-photos");
                break;
            case "productImg":
                uploadPath = path.join(projectRoot, "public", "assets", "images", "product-photos");
                break;
            case "commerceTypeLogo":
                uploadPath = path.join(projectRoot, "public", "assets", "images", "commerce-types-logos");
                break;
            case "commerceLogo":
                uploadPath = path.join(projectRoot, "public", "assets", "images", "commerce-logos");
                break;
            default: 
                uploadPath = path.join(projectRoot, "public", "assets", "images", "general");
        }

        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath);
    },

    filename: (req, file, cb) => {
        const fileName = `${guidV4()}-${file.originalname}`;
        cb(null, fileName);
    }
});

app.use(multer({ storage: imageStorage }).single("imageFile"));

//Serving static fliles
app.use(express.urlencoded());
app.use(express.static(path.join(projectRoot, "public")));

//Routes
app.use(authRoutes);
app.use('/commerce', commerceRoutes);
app.use('/admin', adminRoutes)
app.use('/client', clientRoutes);
app.use('/delivery', deliveryRoutes)

app.use((req, res,  next) => {
    res.status(404).render("404", {"page-title": "404 - Página No Encontrada"});
});

// //DB Sync and Server Startup
 try{
     await context.Sequelize.sync();

     app.listen(port || 5000, () => {
         console.log(`App listening at port ${port}, at: http://localhost:${port}/`);
     });

     console.log("DB Connection Successful.");
    }catch(err){
     console.error(`DB Connection Error: ${err}`);
 }

// const PORT = process.env.PORT || 3000; // forzar 3000 si no hay env

// try {
//     await context.Sequelize.sync({ alter: process.env.DB_ALTER === "true" });

//     app.listen(PORT, '0.0.0.0', () => {
//         console.log(`App listening at port ${PORT}, at: http://localhost:${PORT}/`);
//     });

//     console.log("DB Connection Successful.");
// } catch (err) {
//     console.error(`DB Connection Error: ${err}`);
// }
