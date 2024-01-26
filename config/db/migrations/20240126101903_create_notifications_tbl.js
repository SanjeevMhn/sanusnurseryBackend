/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
	return knex.schema.createTable('notifications', table => {
		table.increments('notification_id').primary(),
		table.integer('sender_id').notNullable(),
		table.integer('receiver_id').notNullable(),
		table.string('notification_desc').notNullable(),
		table.boolean('is_read').defaultTo(false).notNullable(),
		table.timestamp('created_at').defaultTo(knex.fn.now()),
		table.timestamp('updated_at').defaultTo(knex.fn.now())
	})  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
	return knex.schema.dropTable('notifications')
};
