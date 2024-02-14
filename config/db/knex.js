const environment = process.env.NODE_ENV || 'development';
const knexFile = require('../../knexfile');
const knex = require('knex');
module.exports = knex(knexFile[environment]);
