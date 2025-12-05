'use client';

import { useLots } from './lots';
import { useApplications } from './applications';
import { useReceipts } from './receipts';
import { useAllocations } from './allocations';
import { useUsers } from './users';
import { useBranches } from './branches';
import type { ReportEntityKey } from '@/lib/report-definitions';

/**
 * A universal hook to fetch data for the report builder.
 * @param entityKey The key of the entity to fetch (e.g., 'lots', 'applications').
 * @param fields The fields to include in the returned data.
 * @returns The data, loading state, and error from the corresponding entity hook.
 */
export function useReportData(entityKey: ReportEntityKey | null, fields: string[] | null) {
  const lots = useLots();
  const applications = useApplications();
  const receipts = useReceipts();
  const allocations = useAllocations();
  const users = useUsers();
  const branches = useBranches(true); // Fetch all branches for reports

  if (!entityKey || !fields) {
    return { data: null, loading: false, error: null };
  }

  // This could be a switch statement or a map
  const entityHooks: Record<ReportEntityKey, { data: any[] | null; loading: boolean; error: Error | null }> = {
    lots: { data: lots.data, loading: lots.loading, error: lots.error },
    applications: { data: applications.data, loading: applications.loading, error: applications.error },
    receipts: { data: receipts.data, loading: receipts.loading, error: receipts.error },
    allocations: { data: allocations.data, loading: allocations.loading, error: allocations.error },
    users: { data: users.data, loading: users.isLoading, error: users.error },
    branches: { data: branches.data, loading: branches.loading, error: branches.error },
  };

  const { data, loading, error } = entityHooks[entityKey];
  
  // Basic filtering of fields could be done here if needed, but for now we pass all data.
  // And let the table component handle which columns to show.
  return { data, loading, error };
}
