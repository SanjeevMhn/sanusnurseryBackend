/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('orders', table => {
        table.string('user_name'),
        table.string('user_email')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('orders', table => {
        table.dropColumn('user_name'),
        table.dropColumn('user_email')
    })    
};
