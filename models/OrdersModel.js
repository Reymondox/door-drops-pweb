import connection from '../utils/DbConnection.js'
import { DataTypes } from 'sequelize'

const Orders = connection.define('Orders', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    deliveryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        References: {
            model: "Deliveries",
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    commerceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        References: {
            model: "Commerces",
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        References: {
            model: "Users",
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    totalPrice: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    orderedAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "PENDING",
    }

},
{
    freezeTableName: true,
}
);

export default Orders