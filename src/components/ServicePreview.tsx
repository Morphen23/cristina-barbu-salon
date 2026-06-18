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
      className={`glass-card w-full min-w-0 overflow-hidden ${
        compact ? "" : "lg:sticky lg:top-28"
      }`}
    >
      <div
        className={`relative w-full ${
          compact
            ? "aspect-[2/1] max-h-44 sm:aspect-[16/10] sm:max-h-none"
            : "aspect-[2/1] max-h-52 sm:aspect-[16/10] md:aspect-[3/4] md:max-h-[360px] lg:max-h-[420px]"
        }`}
      >
        <Image
          src={visual.image}
          alt={visual.caption}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 320px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(46,44,40,0.4)] via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white sm:p-5">
          <p className="font-display text-xl leading-tight sm:text-2xl">{service.name}</p>
          <p className="mt-0.5 text-xs text-white/85 sm:text-sm">{visual.mood}</p>
        </div>
      </div>
      <div className={`space-y-1.5 ${compact ? "p-3 sm:p-4" : "p-4 sm:p-6"}`}>
        <p className="text-xs leading-relaxed text-muted sm:text-sm">{visual.caption}</p>
        {durationMinutes && (
          <p className="text-[0.6rem] uppercase tracking-[0.14em] text-muted sm:text-[0.65rem]">
            Durată · {formatDuration(durationMinutes)}
          </p>
        )}
        {stylistName && (
          <p className="text-[0.6rem] uppercase tracking-[0.14em] text-accent sm:text-[0.65rem]">
            Cu {stylistName}
          </p>
        )}
      </div>
    </aside>
  );
}
