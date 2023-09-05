/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
 	return knex.schema.alterTable('orders',table => {
 		table.date('order_date').alter()
 	})
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
 	return knex.schema.alterTable('orders',table => {
 		table.timestamp('order_date').defaultTo(knex.fn.now()).alter()
 	})
};