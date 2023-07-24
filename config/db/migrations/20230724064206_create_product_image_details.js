/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('product_image_details', table => {
        table.increments('prod_img_id').primary(),
        table.integer('product_id').notNullable().unsigned(),
        table.string('public_id').notNullable(),
        table.string('signature').notNullable(),
        table.foreign('product_id').references('products.prod_id')
        table.timestamp('created_at').defaultTo(knex.fn.now()),
        table.timestamp('updated_at').defaultTo(knex.fn.now())
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('product_image_details')
};
