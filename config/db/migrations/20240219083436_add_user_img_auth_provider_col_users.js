/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
 return knex.schema.alterTable('users', table => {
  table.string('user_img',255),
  table.string('authProvider',255).defaultTo('self')
 })  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
 return knex.schema.alterTable('users', table => {
  table.dropColumn('user_img'),
  table.dropColumn('authProvider')
 }) 
};
