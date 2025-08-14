import connection from '../utils/DbConnection.js'
import { DataTypes } from 'sequelize'

const TokenPassword = connection.define('TokenPassword', {
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
    token: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    expirationDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
},
{
    freezeTableName: true,
}
);

export default TokenPassword