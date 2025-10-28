import useSWR from "swr";
import { fetchApplications, Application } from "../lib/api";

export type { Application };

export function useApplications(page: number = 1, limit: number = 20, applicationStatus?: string, searchTerm?: string) {
  const { data, error, isLoading, mutate } = useSWR<Application[]>(
    ["applications", applicationStatus, searchTerm, page, limit],
    () => fetchApplications(applicationStatus, searchTerm, page, limit)
  );
console.log(data)
  return {
    applications: data ?? [],
    isLoading,
    isError: error,
    refetch: () => mutate(),
    mutate
  };
}  
