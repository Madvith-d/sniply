import { AuthGuard } from "@/components/auth/AuthGuard";
import { AnalyticsPage } from "@/components/pages/AnalyticsPage";

export default async function AnalyticsRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AuthGuard>
      <AnalyticsPage id={id} />
    </AuthGuard>
  );
}
