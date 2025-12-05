import type { UserRole } from '@/lib/types';

/**
 * A robust role check that handles roles being a string or an array.
 * @param userRoles - The roles from the user document (can be string or array).
 * @returns boolean - True if the user has an Admin role.
 */
export const hasAdminRole = (
  userRoles: UserRole | UserRole[] | undefined
): boolean => {
  if (!userRoles) return false;

  // If userRoles is an array, check if 'Администратор' is included.
  if (Array.isArray(userRoles)) {
    return userRoles.includes('Администратор');
  }

  // If userRoles is a single string, check if it is 'Администратор'.
  return userRoles === 'Администратор';
};
