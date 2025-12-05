import type { UserRole } from '@/lib/types';

/**
 * A robust role check that handles roles being a string or an array and is case-insensitive.
 * @param userRoles - The roles from the user document.
 * @returns boolean - True if the user has an Admin role.
 */
export const hasAdminRole = (
  userRoles: UserRole[] | UserRole | undefined
): boolean => {
  if (!userRoles) return false;

  const adminRoles = ['администратор', 'admin'];

  if (Array.isArray(userRoles)) {
    // Check if any role in the array is an admin role (case-insensitive)
    return userRoles.some(role => adminRoles.includes(role.toLowerCase()));
  }

  // Check if the single role string is an admin role (case-insensitive)
  return adminRoles.includes((userRoles as string).toLowerCase());
};
