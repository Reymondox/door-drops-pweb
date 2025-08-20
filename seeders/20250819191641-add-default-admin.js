'use strict';

export default {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [
      {
        //Default admin (user with id 1)
        name: "Default",
        lastName: "Admin",
        profileName: "Default Admin",
        phoneNumber: "000-000-0000",
        imageUrl: "\\assets\\images\\user-photos\\default-admin-photo.png",
        email: "admin@default.com",
        password: "$2b$10$sJn60767h4ey9BQU/jXVg.BKKcLwi.F1TcVpqMmPSTzB8X0pqdg/a",
        roleId: 1,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date()
      },
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {});
  }
};