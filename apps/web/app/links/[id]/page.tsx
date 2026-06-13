import { AuthGuard } from "@/components/auth/AuthGuard";
import { LinkDetailPage } from "@/components/pages/LinkDetailPage";

export default async function LinkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <AuthGuard>
      <LinkDetailPage id={id} />
    </AuthGuard>
  );
}
