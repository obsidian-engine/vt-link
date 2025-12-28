"use client";

import { ProtectedRoute } from "@/app/_shared/components/ProtectedRoute";
import { AppLayout } from "./_shared/components/app-layout";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}
