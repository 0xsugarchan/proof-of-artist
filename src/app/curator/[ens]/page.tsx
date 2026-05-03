import Link from "next/link";
import { notFound } from "next/navigation";
import { CuratorPageClient } from "@/components/CuratorPageClient";
import { resolveEnsProfile } from "@/lib/ens";

type Props = { params: Promise<{ ens: string }> };

export default async function CuratorPage({ params }: Props) {
  const { ens: enc } = await params;
  const input = decodeURIComponent(enc);
  const result = await resolveEnsProfile(input);

  if (!result.ok) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/artist/${encodeURIComponent(result.profile.name)}`}
          className="text-xs text-muted underline-offset-4 hover:text-zinc-300 hover:underline"
        >
          ← Proof page
        </Link>
        <h1 className="mt-3 text-xl font-semibold tracking-tight">Curator</h1>
        <p className="mt-1 text-xs text-muted">Ask about the artist. Demo replies unless OPENAI_API_KEY is set.</p>
      </div>
      <CuratorPageClient profile={result.profile} />
    </div>
  );
}
