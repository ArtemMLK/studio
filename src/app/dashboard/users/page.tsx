
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUserData } from "@/hooks/use-current-user-data";
import { hasAdminRole } from "@/lib/roles";

export default function UsersPage() {
  const router = useRouter();
  const { currentUserData, isUserLoading } = useCurrentUserData();

  useEffect(() => {
    console.log("UsersPage debug:", {
      isUserLoading,
      currentUserData,
      roles: currentUserData?.roles,
      hasAdminRoleResult: hasAdminRole(currentUserData?.roles),
    });

    if (isUserLoading || !currentUserData) return;

    const isAdmin = hasAdminRole(currentUserData.roles);
    console.log("UsersPage isAdmin:", isAdmin);

    if (!isAdmin) {
      console.log("UsersPage redirect → /dashboard");
      router.replace("/dashboard");
    }
  }, [isUserLoading, currentUserData, router]);

  if (isUserLoading || !currentUserData) {
    return <div>USERS PAGE LOADING</div>;
  }

  const isAdmin = hasAdminRole(currentUserData.roles);
  if (!isAdmin) return <div>USERS PAGE FOR NON‑ADMIN</div>;

  return <div>USERS PAGE FOR ADMIN</div>;
}
