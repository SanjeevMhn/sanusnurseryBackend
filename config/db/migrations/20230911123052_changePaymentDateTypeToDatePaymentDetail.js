/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
	return knex.schema.alterTable('payment_detail',table => {
		table.date('payment_date').alter();
	})
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.alterTable('payment_detail',table => {
 		table.timestamp('payment_date').defaultTo(knex.fn.now()).alter()
 	})
};
