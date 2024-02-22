/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('cart_detail', table => {
    table.bigIncrements('cart_detail_id').primary(),
    table.integer('cart_id').notNullable().unsigned(),
    table.integer('product_id').notNullable(),
    table.integer('product_quantity').notNullable(),
    table.timestamp('created_at').defaultTo(knex.fn.now()),
    table.timestamp('updated_at').defaultTo(knex.fn.now()),
    table.foreign('cart_id').references('cart.cart_id').onDelete('CASCADE')
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropSchemaIfExists('cart_detail')
};
