import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container-content flex flex-col items-center justify-center py-24 text-center">
      <h1 className="font-serif text-4xl text-ink">Page not found</h1>
      <p className="mt-3 text-ink/60">The page you're looking for doesn't exist or may have moved.</p>
      <Link href="/" className="mt-8 rounded-full bg-forest px-6 py-3 text-sm font-semibold text-cream">
        Back to home
      </Link>
    </div>
  );
}
