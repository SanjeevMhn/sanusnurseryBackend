/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('products', table => {
        table.increments('prod_id').primary(),
        table.string('prod_name',255).notNullable(),
        table.integer('prod_category',50).notNullable(),
        table.bigInteger('prod_price').notNullable(),
        table.string('prod_img',255),
        table.boolean('prod_inStock'),
        table.timestamp('created_at').defaultTo(knex.fn.now()),
        table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('products')
};
