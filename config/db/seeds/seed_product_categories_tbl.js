/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('product_categories').del()
  await knex('product_categories').insert([
    {
      prod_cat_name: 'cacti'
    },
    {
      prod_cat_name: 'ferns'
    },
    {
      prod_cat_name: 'flowers'
    },
    {
      prod_cat_name: 'fruits'
    },
    {
      prod_cat_name: 'herbs'
    },
    {
      prod_cat_name: 'shrubs'
    },
    {
      prod_cat_name: 'trees'
    },
    {
      prod_cat_name: 'vegetables'
    },

  ]);
};
