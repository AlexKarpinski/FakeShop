const parseProductsQuery = require('../../utils/productsQuery');

describe('utils/productsQuery', () => {
  it('throws when minPrice is greater than maxPrice', () => {
    expect(() => parseProductsQuery({ minPrice: '20', maxPrice: '10' })).toThrow(
      'minPrice cannot be greater than maxPrice'
    );

    try {
      parseProductsQuery({ minPrice: '20', maxPrice: '10' });
    } catch (error) {
      expect(error.statusCode).toBe(400);
    }
  });

  it('parses valid filters and sorting', () => {
    const result = parseProductsQuery({
      q: 'pro',
      minPrice: '10',
      maxPrice: '100',
      sort: 'price',
      order: 'asc',
      limit: '10',
      offset: '2',
    });

    expect(result).toEqual({
      filter: {
        name: { $regex: 'pro', $options: 'i' },
        price: { $gte: 10, $lte: 100 },
      },
      sort: { price: 1, _id: -1 },
      limit: 10,
      offset: 2,
    });
  });
});
