import type { EnsProfile } from "@/lib/ens";
import { shortAddress } from "@/lib/ens";

type Props = {
  profile: EnsProfile;
  badge?: string;
};

export function IdentityCard({ profile, badge = "Verified ENS" }: Props) {
  const title = profile.displayName || profile.name;

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
          <p className="mt-1 font-mono text-xs text-zinc-400">{shortAddress(profile.address)}</p>
        </div>
      </div>
    </div>
  );
}
