const { computeTotal } = require('../../utils/cartTotals');

describe('utils/cartTotals', () => {
  it('computes total from price and qty', () => {
    const total = computeTotal([
      { price: 10, qty: 2 },
      { price: 5.5, qty: 3 },
    ]);

    expect(total).toBe(36.5);
  });

  it('handles invalid values safely', () => {
    const total = computeTotal([{ price: 'x', qty: 2 }, { price: 4, qty: null }]);
    expect(total).toBe(0);
  });
});
