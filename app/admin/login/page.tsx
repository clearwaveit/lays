import AdminLoginForm from "@/app/components/admin/AdminLoginForm";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Admin Login | Lay's",
  description: "Login to the Lay's campaign admin.",
};

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
