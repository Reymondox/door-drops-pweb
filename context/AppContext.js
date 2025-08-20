import connection from '../utils/DbConnection.js';

import UsersModel from '../models/UsersModel.js';
import RolesModel from '../models/RolesModel.js';
import AdminsModel from '../models/AdminsModel.js';
import CommercesModel from '../models/CommercesModel.js';
import CommerceTypesModel from '../models/CommerceTypesModel.js';
import CategoriesModel from '../models/CategoriesModel.js';
import DeliveriesModel from '../models/DeliveriesModel.js';
import OrdersModel from '../models/OrdersModel.js';
import OrdersProductsModel from '../models/OrdersProductsModel.js';
import ProductsModel from '../models/ProductsModel.js';
import TokenActivationModel from '../models/TokenActivationModel.js';
import TokenPasswordModel from '../models/TokenPasswordModel.js';
import UserAddressModel from '../models/UserAddressModel.js';
import UserFavoritesModel from '../models/UserFavoritesModel.js';
import ITBISModel from '../models/ITBISModel.js';




//Initialize Connection
try{
    await connection.authenticate()
    console.log("Database connection has been established successfully.");
}catch(err){
    console.error(`Error Unable to connect to the database: ${err}`);
}

///RELATIONS

//Users-Roles
UsersModel.belongsTo(RolesModel, { foreignKey: "roleId"});
RolesModel.hasMany(UsersModel, { foreignKey: "roleId"});

//Users-TokenActivation
UsersModel.hasOne(TokenActivationModel, { foreignKey: "userId"});
TokenActivationModel.belongsTo(UsersModel, { foreignKey: "userId"});

//Users-TokenPassword
UsersModel.hasOne(TokenPasswordModel, { foreignKey: "userId" });
TokenPasswordModel.belongsTo(UsersModel, { foreignKey: "userId"});

//Users-UserFavorites
UsersModel.hasMany(UserFavoritesModel, { foreignKey: "userId" });
UserFavoritesModel.belongsTo(UsersModel, { foreignKey: "userId" });

//Users-UserAddress
UsersModel.hasMany(UserAddressModel, { foreignKey: "userId" });
UserAddressModel.belongsTo(UsersModel, { foreignKey: "userId" });

//Users-Delivery
UsersModel.hasOne(DeliveriesModel, { foreignKey: "userId" });
DeliveriesModel.belongsTo(UsersModel, { foreignKey: "userId" });

//Users-Admins
UsersModel.hasOne(AdminsModel, { foreignKey: "userId" });
AdminsModel.belongsTo(UsersModel, { foreignKey: "userId" });

//Users-Commerce
UsersModel.hasOne(CommercesModel, { foreignKey: "userId" });
CommercesModel.belongsTo(UsersModel, { foreignKey: "userId" });

//Commerce-CommerceTypes
CommercesModel.belongsTo(CommerceTypesModel, { foreignKey: "commerceTypeId" });
CommerceTypesModel.hasMany(CommercesModel, { foreignKey: "commerceTypeId" });

//Products-Commerce
CommercesModel.hasMany(ProductsModel, { foreignKey: "commerceId" });
ProductsModel.belongsTo(CommercesModel, { foreignKey: "commerceId" });

//Products-Category
ProductsModel.belongsTo(CategoriesModel, { foreignKey: "categorieId"});
CategoriesModel.hasMany(ProductsModel, { foreignKey: "categorieId"});

//Orders-Commerces
OrdersModel.belongsTo(CommercesModel, { foreignKey: "commerceId" });
CommercesModel.hasMany(OrdersModel, { foreignKey: "commerceId" });

//Orders-Delivery
OrdersModel.belongsTo(DeliveriesModel, { foreignKey: "deliveryId" });
DeliveriesModel.hasMany(OrdersModel, { foreignKey: "deliveryId" });

//Orders-Clients
OrdersModel.belongsTo(UsersModel, { foreignKey: "userId" });
UsersModel.hasMany(OrdersModel, { foreignKey: "userId" });

//Orders-OrdersProducts
OrdersModel.hasMany(OrdersProductsModel, { foreignKey: "orderId" });
OrdersProductsModel.belongsTo(OrdersModel, { foreignKey: "orderId" });

//Products-OrdersProducts
ProductsModel.hasMany(OrdersProductsModel, { foreignKey: "productId" });
OrdersProductsModel.belongsTo(ProductsModel, { foreignKey: "productId" });


// lastly added by gui2
CommercesModel.hasMany(CategoriesModel, {foreignKey: 'commerceId'})
CategoriesModel.belongsTo(CommercesModel, {foreignKey: 'commerceId'})

UserFavoritesModel.belongsTo(CommercesModel, {foreignKey: 'commerceId'})
CommercesModel.hasMany(UserFavoritesModel, {foreignKey: 'commerceId'})

export default{
    Sequelize: connection, 
    UsersModel,
    RolesModel,
    AdminsModel,
    CommercesModel,
    CommerceTypesModel,
    CategoriesModel,
    DeliveriesModel,
    OrdersModel,
    OrdersProductsModel,
    ProductsModel,
    TokenActivationModel,
    TokenPasswordModel,
    UserAddressModel,
    UserFavoritesModel,
    ITBISModel
}
