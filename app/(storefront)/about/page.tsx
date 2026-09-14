import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About',
  description: 'LzgPaw makes simple, reusable pet-care tools for the everyday mess of loving a pet.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="container-content max-w-2xl py-16">
      <h1 className="font-serif text-4xl text-ink">About LzgPaw</h1>
      <div className="mt-6 flex flex-col gap-5 text-ink/75">
        <p>
          LzgPaw makes simple, well-made tools for one of the most universal parts of having a pet: the mess. Our
          first product, the Pet Hair Remover Roller, exists for one reason — pet hair collects on furniture, car
          seats, and clothing faster than most tools can keep up with, and we wanted something reusable that
          actually works, without batteries, refills, or replacement parts to keep buying.
        </p>
        <p>
          We keep the lineup focused rather than broad, and we'd rather sell one product well than pad a catalog
          with things we haven't fully stood behind. Every claim on this site describes what a product actually
          does — we don't publish invented reviews, ratings, or customer counts, and we don't plan to start.
        </p>
        <p className="text-sm text-ink/50">
          [This is a starting point — personalize it with your own founding story, location, or team once you're
          ready to share it. Keep it accurate: this brief is explicit that nothing on the site should be invented.]
        </p>
      </div>
    </div>
  );
}
