import AdminDashboard from "@/app/components/admin/AdminDashboard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campaign Admin | Lay's",
  description: "Manage campaign matches, teams, restaurants, and schedule drafts.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
