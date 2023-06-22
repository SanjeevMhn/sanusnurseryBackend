/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('products', table => {
        table.integer('pord_category').unsigned()
        table.foreign('prod_category').references('product_categories.prod_cat_id')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('products',table => {
        table.dropForeign('prod_category');
    })
};
