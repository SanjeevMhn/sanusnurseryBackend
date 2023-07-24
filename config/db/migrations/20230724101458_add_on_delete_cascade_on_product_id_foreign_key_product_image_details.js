/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('product_image_details',table => {
        table.dropForeign('product_id'),
        table.foreign('product_id').references('products.prod_id').onDelete('CASCADE')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('products_image_details',table => {
        table.foreign('product_id').references('products.prod_id')
    })
};
