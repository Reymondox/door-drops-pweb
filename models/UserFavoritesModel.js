import connection from '../utils/DbConnection.js'
import { DataTypes } from 'sequelize'

const UserFavorites = connection.define('UserFavorites', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
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
    commerceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        References: {
            model: "Commerces",
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

export default UserFavorites