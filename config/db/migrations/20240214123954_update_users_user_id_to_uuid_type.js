/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
 return knex.schema.alterTable('users', table => {
   table.uuid('user_uuid').defaultTo(knex.raw("uuid_generate_v4()")).notNullable()
 })  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.alterTable('users',table => {
    table.dropColumn('user_uuid')
  })
};
