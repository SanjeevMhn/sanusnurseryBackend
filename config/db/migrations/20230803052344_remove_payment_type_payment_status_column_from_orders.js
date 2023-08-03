/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
 	return knex.schema.alterTable('orders',table => {
 		table.dropColumn('payment_type');
 		table.dropColumn('payment_status');
 	})
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	table.integer('payment_type');
	table.string('payment_status');
};
