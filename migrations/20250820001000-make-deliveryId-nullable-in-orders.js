'use strict';

export default {
  up: async(queryInterface, Sequelize) => {
    // permitir NULL y setear SET NULL al borrar
    await queryInterface.changeColumn('Orders', 'deliveryId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: 'Deliveries', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  },

  down: async(queryInterface, Sequelize) => {
    // volver a NOT NULL y CASCADE (reversible)
    await queryInterface.changeColumn('Orders', 'deliveryId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'Deliveries', key: 'id' },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }
};
