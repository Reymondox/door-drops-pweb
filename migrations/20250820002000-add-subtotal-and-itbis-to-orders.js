'use strict';

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Orders', 'subtotal', {
      type: Sequelize.DOUBLE,     
      allowNull: false,
      defaultValue: 0
    });

    await queryInterface.addColumn('Orders', 'itbisPercent', {
      type: Sequelize.DOUBLE,    
      allowNull: false,
      defaultValue: 18
    });
  },

  down: async(queryInterface) => {
    await queryInterface.removeColumn('Orders', 'subtotal');
    await queryInterface.removeColumn('Orders', 'itbisPercent');
  }
};