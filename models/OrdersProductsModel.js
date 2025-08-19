import connection from '../utils/DbConnection.js'
import { DataTypes } from 'sequelize'

const OrdersProducts = connection.define('OrdersProducts', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        References: {
            model: "Orders",
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        References: {
            model: "Products",
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    }
},
{
    freezeTableName: true,
}
);

export default OrdersProducts