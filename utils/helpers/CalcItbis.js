export function CalcItbis(subtotal, percent) {
  const s = Number(subtotal || 0);
  const p = Number(percent || 0);
  return s * (p / 100);
}
