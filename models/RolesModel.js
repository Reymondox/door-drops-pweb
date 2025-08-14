import connection from '../utils/DbConnection.js'
import { DataTypes } from 'sequelize'

const Roles = connection.define('Roles', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
},
{
    freezeTableName: true,
}
);

export default Roles