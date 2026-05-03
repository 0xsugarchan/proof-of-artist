import type { EnsProfile } from "@/lib/ens";
import Link from "next/link";

type Props = {
  profile: EnsProfile;
  badge?: string;
};

export function IdentityCard({ profile, badge = "Verified ENS" }: Props) {
  const title = profile.displayName || profile.name;
  const xHandle = profile.xHandle?.trim().replace(/^@/, "") || null;
  const xHref = xHandle ? `https://x.com/${encodeURIComponent(xHandle)}` : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-panel/90 shadow-xl shadow-black/40">
      <div className="flex gap-4 p-4 sm:p-5">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-line bg-zinc-900 sm:h-24 sm:w-24">
          {profile.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatar}
              alt=""
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center font-mono text-xs text-muted"
              aria-hidden
            >
              {profile.name.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-mono uppercase tracking-widest text-accent">{badge}</p>
          <h1 className="truncate text-lg font-semibold tracking-tight sm:text-xl">{title}</h1>
          <p className="truncate font-mono text-xs text-muted">{profile.name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            {xHref ? (
              <Link
                href={xHref}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-xs text-accent/90 underline-offset-4 hover:text-accent hover:underline"
              >
                x.com/{xHandle}
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
