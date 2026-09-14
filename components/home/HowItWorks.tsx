import { RotateCw, Layers, PackageOpen, RefreshCcw } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: RotateCw,
    title: 'Roll',
    description: 'Glide the roller over the surface to lift pet hair from furniture, bedding, carpet, or clothing.',
  },
  {
    number: '02',
    icon: Layers,
    title: 'Collect',
    description: 'Hair collects neatly inside the device as you go — nothing scatters back onto the surface.',
  },
  {
    number: '03',
    icon: PackageOpen,
    title: 'Empty',
    description: 'Open the collection compartment and empty it out in seconds.',
  },
  {
    number: '04',
    icon: RefreshCcw,
    title: 'Reuse',
    description: 'No batteries, no refills, no lint sheets to replace — empty it and use it again right away.',
  },
];

export function HowItWorks() {
  return (
    <section className="container-content py-16 sm:py-20">
      <h2 className="text-center font-serif text-3xl text-ink sm:text-4xl">How it works</h2>

      <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((step) => (
          <div key={step.number} className="relative rounded-2xl bg-white/60 p-6 text-center">
            <span className="font-serif text-sm text-forest/40">{step.number}</span>
            <div className="mx-auto mt-2 flex h-14 w-14 items-center justify-center rounded-full bg-sage text-forest">
              <step.icon size={24} strokeWidth={1.75} aria-hidden="true" />
            </div>
            <h3 className="mt-4 font-serif text-xl text-ink">{step.title}</h3>
            <p className="mt-2 text-sm text-ink/65">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
