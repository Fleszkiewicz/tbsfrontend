import { useQuery } from "@tanstack/react-query";
import { financeStore } from "../store/financeStore";
import { getSummary } from "../services/finance.services";

export function useFinance() {
  const { year, month, currency } = financeStore();

  return useQuery({
    queryKey: ["finance", year, month, currency],
    queryFn: () => getSummary(year, month, currency),
  });
}
