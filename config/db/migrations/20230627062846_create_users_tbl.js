/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
const Role = require('../../enums/roles');

exports.up = function(knex) {
    return knex.schema.createTable('users', table => {
        table.bigIncrements('user_id').primary(),
        table.string('user_name',255).notNullable(),
        table.string('user_email',255).notNullable().unique(),
        table.string('user_password',255).notNullable(),
        table.timestamp('created_at').defaultTo(knex.fn.now()),
        table.timestamp('updated_at').defaultTo(knex.fn.now()),
        table.integer('role_id').notNullable().unsigned().defaultTo(Role.User),
        table.foreign('role_id').references('roles.role_id')
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('users');
};
