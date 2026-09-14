interface AnnouncementBarProps {
  text: string;
}

export function AnnouncementBar({ text }: AnnouncementBarProps) {
  if (!text) return null;

  return (
    <div className="bg-forest px-4 py-2 text-center text-xs font-medium tracking-wide text-cream sm:text-sm">
      {text}
    </div>
  );
}
