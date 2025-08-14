import connection from '../utils/DbConnection.js'
import { DataTypes } from 'sequelize'

const Products = connection.define('Products', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
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
    categorieId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        References: {
            model: "Categories",
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    price: {
        type: DataTypes.DOUBLE,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.TEXT,
        allowNull: false
    },
},
{
    freezeTableName: true,
}
);

export default Products