'use strict';

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Roles', [
      {
        name: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'client',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'delivery',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'commerce',
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Roles', null, {});
  }
};