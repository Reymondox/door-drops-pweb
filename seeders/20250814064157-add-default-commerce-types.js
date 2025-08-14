'use strict';
import path from 'path'
const imageUrl = path.join('assets', 'images', 'uploaded', 
  '6cc0a5ac-3ff4-467b-bdaa-b2cdc9ffbc5f-0130054_el-principito-portada-azul_550.jpg')
  
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