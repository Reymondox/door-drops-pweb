import connection from '../utils/DbConnection.js'
import { DataTypes } from 'sequelize'

const Admins = connection.define('Admins', {
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
    idCard: {
        type: DataTypes.TEXT,
        allowNull: false,
    }
},
{
    freezeTableName: true,
}
);

export default Admins