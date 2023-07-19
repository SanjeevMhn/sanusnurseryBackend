/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('order_details',table => {
        table.increments('order_detail_id').primary(),
        table.foreign('order_id').references('orders.order_id').onDelete('CASCADE'),
        table.integer('product_id').notNullable(),
        table.integer('product_quantity').notNullable(),
        table.timestamp('created_at').defaultTo(knex.fn.now()),
        table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('order_details')
};
