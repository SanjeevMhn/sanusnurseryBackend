/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('cart', table => {
      table.bigIncrements('cart_id').primary(),
      table.bigInteger('cart_total').notNullable(),
      table.integer('user_id').notNullable().unsigned(),
      table.timestamp('created_at').defaultTo(knex.fn.now()),
      table.timestamp('updated_at').defaultTo(knex.fn.now()),
      table.foreign('user_id').references('users.user_id').onDelete('CASCADE')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropSchemaIfExists('cart')
};
