/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('payment_detail',table => {
        table.increments('payment_id').primary(),
        table.integer('order_id').notNullable(),
        table.integer('total_amount').notNullable(),
        table.integer('payment_type').notNullable(),
        table.string('payment_status').notNullable().defaultTo('PENDING'),
        table.timestamp('created_at').defaultTo(knex.fn.now()),
        table.timestamp('updated_at').defaultTo(knex.fn.now()),
        table.foreign('payment_type').references('payment_category.payment_id')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('payment_details')
};
