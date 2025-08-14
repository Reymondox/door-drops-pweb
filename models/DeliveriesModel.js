import connection from '../utils/DbConnection.js'
import { DataTypes } from 'sequelize'

const Deliveries = connection.define('Deliveries', {
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
    status: {
        type: DataTypes.STRING,
        defaultValue: "FREE",
    }
},
{
    freezeTableName: true,
}
);

export default Deliveries