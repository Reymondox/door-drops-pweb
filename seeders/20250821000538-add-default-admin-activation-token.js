'use strict';

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('TokenActivation', [
      {
        //Token for default admin (user with id 1)
        userId: 1,
        token: null,
        expirationDate: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('TokenActivation', null, {});
  }
};