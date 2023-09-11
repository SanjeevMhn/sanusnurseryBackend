/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
 	return knex.schema.alterTable('orders',table => {
 		table.dropColumn('order_total')
 	})
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
 	return knex.schema.alterTable('orders',table => {
 		table.integer('order_total')
 	})
};
