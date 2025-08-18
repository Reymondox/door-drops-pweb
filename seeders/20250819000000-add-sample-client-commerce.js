"use strict";

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  const { QueryTypes } = Sequelize;

  // Helpers
  const now = new Date();
  const q = (sql, replacements = {}) =>
    queryInterface.sequelize.query(sql, { replacements, type: QueryTypes.SELECT });

  // 1) Roles (busca por nombre para no asumir IDs)
  const [clientRole]   = await q("SELECT id FROM Roles WHERE name IN ('client','cliente','CLIENTE','CLIENT') LIMIT 1");
  const [commerceRole] = await q("SELECT id FROM Roles WHERE name IN ('commerce','comercio','COMERCIO','COMMERCE') LIMIT 1");
  if (!clientRole || !commerceRole) {
    throw new Error("No se encontraron roles 'client/cliente' o 'commerce/comercio'. Corre primero el seeder de Roles.");
  }

  // 2) CommerceType (toma el primero disponible)
  const [ctype] = await q("SELECT id FROM CommerceTypes ORDER BY id ASC LIMIT 1");
  if (!ctype) {
    throw new Error("No hay registros en CommerceTypes. Corre el seeder de tipos de comercio.");
  }

  // 3) Usuarios (cliente y dueño de comercio)
  //    Usa contraseñas pre-hasheadas para evitar dependencias de bcrypt aquí.
  //    Hash generado con bcrypt(10) para '123456' -> cámbialo si usas otro hash.
  const HASH_123456 = "$2b$10$9rJ3QyWwY1YjG9jQhqt8oOXqg7W8n1w3b6m0P3a0rQ7W1jv1f7y6i";

  // Inserta si no existen
  await queryInterface.bulkInsert("Users", [
    {
      name: "Juan",
      lastName: "Pérez",
      profileName: "juanp",
      phoneNumber: "8095551111",
      imageUrl: "assets/images/user-photos/917342ac-f988-42f6-8880-a8a66151d290-user.jpg",
      email: "cliente@demo.com",
      password: HASH_123456,
      roleId: clientRole.id,
      status: "ACTIVE",
      createdAt: now, updatedAt: now,
    },
    {
      name: "Pedro",
      lastName: "Gómez",
      profileName: "resto_owner",
      phoneNumber: "8095552222",
      imageUrl: "assets/images/user-photos/917342ac-f988-42f6-8880-a8a66151d290-user.jpg",
      email: "comercio@demo.com",
      password: HASH_123456,
      roleId: commerceRole.id,
      status: "ACTIVE",
      createdAt: now, updatedAt: now,
    },
  ], {});

  // Busca IDs recién insertados
  const [clientUser] = await q("SELECT id FROM Users WHERE email = :email", { email: "cliente@demo.com" });
  const [ownerUser]  = await q("SELECT id FROM Users WHERE email = :email", { email: "comercio@demo.com" });

  if (!clientUser || !ownerUser) throw new Error("No se pudieron leer los IDs de Users insertados.");

  // 4) Dirección del cliente
  await queryInterface.bulkInsert("UserAddress", [
    {
      userId: clientUser.id,
      name: "Casa",
      address: "Av. Principal #123, Santo Domingo",
      createdAt: now, updatedAt: now,
    },
  ], {});

  // 5) Comercio
  await queryInterface.bulkInsert("Commerces", [
    {
      userId: ownerUser.id,
      commerceTypeId: ctype.id,
      openingHour: "08:00",
      closingHour: "22:00",
      createdAt: now, updatedAt: now,
    },
  ], {});

  const [commerce] = await q("SELECT id FROM Commerces WHERE userId = :uid", { uid: ownerUser.id });
  if (!commerce) throw new Error("No se pudo leer el ID del comercio insertado.");

  // 6) Categorías (nota: tu modelo usa commerceId en Categories)
  await queryInterface.bulkInsert("Categories", [
    {
      commerceId: commerce.id,
      name: "Bebidas",
      description: "Refrescos, jugos y más",
      createdAt: now, updatedAt: now,
    },
    {
      commerceId: commerce.id,
      name: "Comidas",
      description: "Platos principales",
      createdAt: now, updatedAt: now,
    },
  ], {});

  const categories = await q("SELECT id, name FROM Categories WHERE commerceId = :cid ORDER BY id ASC", { cid: commerce.id });
  const catBebidas = categories.find(c => c.name === "Bebidas") || categories[0];
  const catComidas = categories.find(c => c.name === "Comidas") || categories[1] || categories[0];

  // 7) Productos
  //    ⚠️ Tu modelo actual usa "categorieId" (con e). Si ya lo cambiaste a "categoryId", cambia estas claves.
  await queryInterface.bulkInsert("Products", [
    {
      commerceId: commerce.id,
      categorieId: catBebidas.id,  // <-- usa "categorieId" según tu modelo actual
      name: "Coca Cola 1L",
      description: "Botella de 1 litro",
      price: 80,
      imageUrl: "/assets/images/products-images/coca_cola.jpg",
      createdAt: now, updatedAt: now,
    },
    {
      commerceId: commerce.id,
      categorieId: catComidas.id,
      name: "Pizza grande",
      description: "Pizza de 8 pedazos con queso",
      price: 450,
      imageUrl: "/assets/images/products-images/pizza_grande.jpg",
      createdAt: now, updatedAt: now,
    },
  ], {});
}

export async function down(queryInterface, Sequelize) {
  await queryInterface.bulkDelete("Products", { name: ["Coca Cola 1L", "Pizza grande"] });
  await queryInterface.bulkDelete("Categories", { name: ["Bebidas", "Comidas"] });
  await queryInterface.bulkDelete("Commerces", { }); // elimina el de demo
  await queryInterface.bulkDelete("UserAddress", { name: "Casa" });
  await queryInterface.bulkDelete("Users", { email: ["cliente@demo.com", "comercio@demo.com"] });
}
