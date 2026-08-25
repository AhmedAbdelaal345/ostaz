export function selectApplicableCredits(amounts: number[], capacity: number) {
  let remaining = Math.max(0, capacity);
  const selectedIndexes: number[] = [];
  let applied = 0;
  amounts.forEach((amount, index) => {
    const normalized = Math.max(0, amount);
    if (normalized > 0 && normalized <= remaining) {
      selectedIndexes.push(index);
      applied += normalized;
      remaining -= normalized;
    }
  });
  return { selectedIndexes, applied };
}
