/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
 	return knex.schema.createTable('payment_category',table => {
		table.increments('payment_id').primary(),
		table.string('payment_type',255),
		table.timestamp('created_at').defaultTo(knex.fn.now()),
		table.timestamp('updated_at').defaultTo(knex.fn.now())
	}) 
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
	return knex.schema.dropTableIfExists('payment_category')
};
