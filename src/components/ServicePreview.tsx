import Image from "next/image";
import { formatDuration } from "@/lib/balayage";
import { getServiceVisual } from "@/lib/booking-ui";
import type { Service } from "@/lib/config";

type ServicePreviewProps = {
  service?: Service;
  stylistName?: string;
  durationMinutes?: number | null;
  compact?: boolean;
};

export default function ServicePreview({
  service,
  stylistName,
  durationMinutes,
  compact = false,
}: ServicePreviewProps) {
  if (!service) return null;

  const visual = getServiceVisual(service.id);

  return (
    <aside
      className={`glass-card overflow-hidden ${compact ? "" : "lg:sticky lg:top-28"}`}
    >
      <div className={`relative w-full ${compact ? "aspect-[4/3]" : "aspect-[3/4] max-h-[420px]"}`}>
        <Image
          src={visual.image}
          alt={visual.caption}
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 320px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(46,44,40,0.35)] via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="font-display text-2xl leading-tight">{service.name}</p>
          <p className="mt-1 text-sm text-white/85">{visual.mood}</p>
        </div>
      </div>
      <div className={`space-y-2 ${compact ? "p-4" : "p-6"}`}>
        <p className="text-sm leading-relaxed text-muted">{visual.caption}</p>
        {durationMinutes && (
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-muted">
            Durată · {formatDuration(durationMinutes)}
          </p>
        )}
        {stylistName && (
          <p className="text-[0.65rem] uppercase tracking-[0.18em] text-accent">
            Cu {stylistName}
          </p>
        )}
      </div>
    </aside>
  );
}
