/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
  // Deletes ALL existing entries
  await knex('products').del()
  await knex('products').insert([
    {
      prod_name: 'Rose Plant',
      prod_category: 2,
      prod_price: 40,
      prod_img: null,
      prod_inStock: true,
    },
    {
      prod_name: 'Aloevera Plant',
      prod_category: 3,
      prod_price: 40,
      prod_img: null,
      prod_inStock: true,
    },
    {
      prod_name: 'Marigold FLower',
      prod_category: 2,
      prod_price: 40,
      prod_img: null,
      prod_inStock: true,
    },
    {
      prod_name: 'Banana Plant',
      prod_category: 3,
      prod_price: 40,
      prod_img: null,
      prod_inStock: true,
    },
    {
      prod_name: 'Cacti Plant',
      prod_category: 8,
      prod_price: 40,
      prod_img: null,
      prod_inStock: true,
    },

  ]);
};
