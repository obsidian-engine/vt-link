"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/app-layout";

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
