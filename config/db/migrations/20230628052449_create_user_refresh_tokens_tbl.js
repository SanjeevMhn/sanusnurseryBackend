/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('user_refresh_tokens',table => {
        table.increments('token_id').primary(), 
        table.integer('user_id').notNullable(),
        table.string('token',255).notNullable().unique(),
        table.timestamp('expires_at').notNullable(),
        table.foreign('user_id').references('users.user_id')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('user_refresh_tokens');
};
