/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
 	return knex.schema.alterTable('payment_detail',table => {
 		table.timestamp('payment_date')
 	}) 
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
 	return knex.schema.alterTable('payment_detail',table => {
 		table.dropColumn('payment_date')
 	})
};
