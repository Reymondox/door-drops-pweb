'use strict';

const imageUrl = ('\\assets\\images\\commerce-types-logos\\heladitos.png')

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('CommerceTypes', [
      {
        name: 'Heladeria',
        imageUrl: imageUrl, 
        description: 'Venta de helados',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('CommerceTypes', null, {});
  }
};