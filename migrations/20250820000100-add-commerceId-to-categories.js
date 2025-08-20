"use strict";

export async function up(queryInterface, Sequelize) {
  // En SQLite es seguro agregarla como NULL primero
  // (evitamos fallar si ya hay filas antiguas en Categories)
  const table = "Categories";
  const column = "commerceId";

  // Evitar duplicado si ya existe la columna
  // (SQLite: usamos PRAGMA para inspección)
  try {
    const rows = await queryInterface.sequelize.query(
      `SELECT name FROM pragma_table_info('${table}') WHERE name = :col`,
      { replacements: { col: column }, type: Sequelize.QueryTypes.SELECT }
    );
    if (rows.length > 0) return; // ya existe, nada que hacer
  } catch (_) {}

  await queryInterface.addColumn(table, column, {
    type: Sequelize.INTEGER,
    allowNull: true, // <- primero NULL para no romper migración con datos existentes
    references: { model: "Commerces", key: "id" },
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  });

  // Si quieres, aquí podrías backfillear valores (opcional).
  // Luego, cuando todo esté consistente, podrías endurecer a NOT NULL:
  // await queryInterface.changeColumn(table, column, { ...allowNull: false });
}

export async function down(queryInterface, Sequelize) {
  const table = "Categories";
  const column = "commerceId";

  // Elimina sólo si existe
  try {
    const rows = await queryInterface.sequelize.query(
      `SELECT name FROM pragma_table_info('${table}') WHERE name = :col`,
      { replacements: { col: column }, type: Sequelize.QueryTypes.SELECT }
    );
    if (rows.length === 0) return;
  } catch (_) {}

  await queryInterface.removeColumn(table, column);
}
