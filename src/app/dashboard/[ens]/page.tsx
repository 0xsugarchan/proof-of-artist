import Link from "next/link";
import { notFound } from "next/navigation";
import { DashboardEditor } from "@/components/DashboardEditor";
import { resolveEnsProfile } from "@/lib/ens";

type Props = { params: Promise<{ ens: string }> };

export default async function DashboardPage({ params }: Props) {
  const { ens: enc } = await params;
  const input = decodeURIComponent(enc);
  const result = await resolveEnsProfile(input);

  if (!result.ok) {
    notFound();
  }

  const { profile } = result;

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/"
          className="text-xs text-muted underline-offset-4 hover:text-zinc-300 hover:underline"
        >
          ← Home
        </Link>
        <h1 className="mt-3 text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-xs text-muted">Contracts and copy stay in this browser (local demo).</p>
      </div>

      <DashboardEditor profile={profile} />
    </div>
  );
}
