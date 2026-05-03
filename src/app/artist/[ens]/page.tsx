import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicArtistView } from "@/components/PublicArtistView";
import { resolveEnsProfile } from "@/lib/ens";

type Props = { params: Promise<{ ens: string }> };

export default async function PublicArtistPage({ params }: Props) {
  const { ens: enc } = await params;
  const input = decodeURIComponent(enc);
  const result = await resolveEnsProfile(input);

  if (!result.ok) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-widest text-accent">Public proof</p>
        <Link
          href={`/curator/${encodeURIComponent(result.profile.name)}`}
          className="text-xs text-muted underline-offset-4 hover:text-accent hover:underline"
        >
          Curator →
        </Link>
      </div>
      <PublicArtistView profile={result.profile} />
    </div>
  );
}
