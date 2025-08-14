import connection from '../utils/DbConnection.js'
import { DataTypes } from 'sequelize'

const Users = connection.define('Users', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    profileName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false
    },
    imageUrl: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        References: {
            model: "Roles",
            key: "id"
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE"
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "INACTIVE",
    },
    deletedAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
},
{
    freezeTableName: true,
}
);

export default Users