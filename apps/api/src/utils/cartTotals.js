function computeTotal(items = []) {
  return items.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;
    return sum + price * qty;
  }, 0);
}

module.exports = {
  computeTotal,
};
