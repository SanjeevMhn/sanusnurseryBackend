/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('payment_category').del()
  await knex('payment_category').insert([
    {
      payment_type: 'cash'
    },
    {
      payment_type: 'esewa'
    },
    {
      payment_type: 'khalti'
    },
  ]);
};
