
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('orders', table => {
        table.increments('order_id').primary(),
        table.bigInteger('order_number').unique().notNullable(),
        table.integer('user_id').nullable(),
        table.timestamp('order_date').notNullable(),
        table.integer('order_total').notNullable(),
        table.string('order_status').notNullable().defaultTo('PENDING'),
        table.string('delivery_address').notNullable(),
        table.string('user_contact').notNullable(),
        table.integer('payment_id').notNullable(),
        table.timestamp('created_at').defaultTo(knex.fn.now()),
        table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('orders');
};
