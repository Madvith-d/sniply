import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardPage } from "@/components/pages/DashboardPage";

export default function Dashboard() {
  return (
    <AuthGuard>
      <DashboardPage />
    </AuthGuard>
  );
}
