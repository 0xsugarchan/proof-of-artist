import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4 py-10 text-center">
      <h1 className="text-lg font-semibold">Page not found</h1>
      <p className="text-sm text-muted">That ENS did not resolve, or the URL is wrong.</p>
      <Link href="/" className="inline-block text-sm text-accent underline-offset-4 hover:underline">
        Back home
      </Link>
    </div>
  );
}
