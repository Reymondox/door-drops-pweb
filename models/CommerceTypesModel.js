import connection from '../utils/DbConnection.js'
import { DataTypes } from 'sequelize'

const CommerceTypes = connection.define('CommerceTypes', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    },
},
{
    freezeTableName: true,
}
);

export default CommerceTypes