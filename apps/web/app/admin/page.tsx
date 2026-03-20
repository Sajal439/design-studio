import { redirect } from "next/navigation";

export default async function AdminDashboardPage() {
  // Since we are no longer building a SaaS CRM, the admin panel simply
  // acts as a content manager for Designs (and future PriceBook).
  redirect("/admin/designs");
}
