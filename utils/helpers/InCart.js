export function InCart(items, productId) {
  if (!Array.isArray(items)) return false;
  return items.some(i => Number(i.productId) === Number(productId));
}