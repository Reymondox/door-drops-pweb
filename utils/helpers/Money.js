export function Money(value) {
  const n = Number(value || 0);
  return n.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}