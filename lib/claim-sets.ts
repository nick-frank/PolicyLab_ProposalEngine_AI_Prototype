import type { CostAllocationEntry, MockClaim } from "@/lib/types";

export function validateAllocationsSum(allocations: CostAllocationEntry[]) {
  const sum = allocations.reduce((acc, a) => acc + a.percentage, 0);
  return {
    sum,
    isValid: sum === 100,
    remaining: 100 - sum,
  };
}

export function computeAllocatedAmounts(
  totalCost: number,
  allocations: CostAllocationEntry[]
) {
  return allocations.map((a) => ({
    formNumber: a.formNumber,
    formName: a.formName,
    percentage: a.percentage,
    amount: Math.round((totalCost * a.percentage) / 100 * 100) / 100,
  }));
}

export function getSetTotalCost(
  claimIds: string[],
  claimsMap: Map<string, MockClaim>
): number {
  return claimIds.reduce((sum, id) => {
    const claim = claimsMap.get(id);
    return sum + (claim?.amount ?? 0);
  }, 0);
}
