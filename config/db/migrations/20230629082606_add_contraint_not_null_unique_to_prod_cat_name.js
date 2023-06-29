/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('product_categories',table => {
        table.unique('prod_cat_name');
        table.dropNullable('prod_cat_name');
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('product_categories', table => {
        table.dropUnique('prod_cat_name');
        table.setNullable('prod_cat_name');
    })
};
