/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
 return knex.schema.alterTable('users', table => {
   table.dropColumn('user_id'),
   table.uuid('user_uuid').defaultTo(knex.raw("uuid_generate_v4()")).notNullable(),
   table.renameColumn('user_uuid','user_id')
   table.primary('user_id')
 })  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('users',table => {
    table.dropColumn('user_id'),
    table.bigIncrements('user_intId'),
    table.renameColumn('user_intId','user_id'),
    table.primary('user_id')
  })
};
