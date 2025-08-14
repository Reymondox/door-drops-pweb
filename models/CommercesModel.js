import connection from '../utils/DbConnection.js'
import { DataTypes } from 'sequelize'

const Commerces = connection.define('Commerces', {
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
    commerceTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        References: {
            model: "CommerceTypes",
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    openingHour: {
        type: DataTypes.TEXT,
        allowNull: false
    }, 
    closingHour: {
        type: DataTypes.TEXT,
        allowNull: false

    }
},
{
    freezeTableName: true,
}
);

export default Commerces