import connection from '../utils/DbConnection.js'
import { DataTypes } from 'sequelize'

const ITBIS = connection.define('ITBIS', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    percentage: {
        type: DataTypes.DOUBLE,
        allowNull: false,
        defaultValue:  18,
    }
},
{
    freezeTableName: true,
}
);

export default ITBIS