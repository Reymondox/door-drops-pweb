import connection from '../utils/DbConnection.js'
import { DataTypes } from 'sequelize'

const Categories = connection.define('Categories', {
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
    description: {
        type: DataTypes.TEXT,
        allowNull: false
    }
},
{
    freezeTableName: true,
}
);

export default Categories