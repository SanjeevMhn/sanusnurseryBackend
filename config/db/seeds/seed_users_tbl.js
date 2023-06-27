/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('users').del()
  await knex('users').insert([
    {
      user_name: 'Ram Sharma',
      user_email: 'ram@gmail.com',
      user_password: '12345678',
    },
    {
      user_name: 'Shyam Rai',
      user_email: 'shyam@gmail.com',
      user_password: '12345678',
    },
    {
      user_name: 'Rita Sharma',
      user_email: 'rita@gmail.com',
      user_password: '12345678',
    },
    {
      user_name: 'Prithivi Shrestha',
      user_email: 'prithivi@gmail.com',
      user_password: '12345678',
    },
    {
      user_name: 'Brisha Sharma',
      user_email: 'brisha@gmail.com',
      user_password: '12345678',
    },
  ]);
};
