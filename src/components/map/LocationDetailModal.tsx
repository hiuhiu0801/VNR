import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BookOpen, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, FileText, MapPinned, ScrollText, X, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { phaseById } from "../../data/august1945Route";
import type { HistoricalRoutePoint, RoutePhaseId } from "../../types/august1945";

export type HistoricalRouteLocationDetail = {
  id: string;
  title: string;
  place: string;
  mapLabel: string;
  events: HistoricalRoutePoint[];
};

type LocationDetailModalProps = {
  location: HistoricalRouteLocationDetail;
  totalLocations: number;
  onClose: () => void;
};

export function LocationDetailModal({ location, totalLocations, onClose }: LocationDetailModalProps) {
  const [activeEventId, setActiveEventId] = useState(location.events[0]?.id ?? "");

  useEffect(() => {
    setActiveEventId(location.events[0]?.id ?? "");
  }, [location.id, location.events]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const activeEvent = useMemo(
    () => location.events.find((event) => event.id === activeEventId) ?? location.events[0],
    [activeEventId, location.events],
  );

  if (!activeEvent) return null;

  const phase = phaseById[activeEvent.phaseId];
  const featuredImage = activeEvent.images[0];
  const activeSurfaceClass = getPhaseSurfaceClass(activeEvent.phaseId);
  const activeEventIndex = Math.max(
    0,
    location.events.findIndex((event) => event.id === activeEvent.id),
  );
  const selectEventByIndex = (nextIndex: number) => {
    const wrappedIndex = (nextIndex + location.events.length) % location.events.length;
    setActiveEventId(location.events[wrappedIndex].id);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/65 p-3 backdrop-blur-md md:p-5" onClick={onClose}>
      <motion.article
        key={location.id}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="relative grid h-[88vh] max-h-[900px] w-full max-w-6xl overflow-hidden border border-white/10 bg-stone-950 text-white shadow-2xl lg:grid-cols-[0.86fr_1.14fr]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="historical-location-title"
      >
        <aside className={`${activeSurfaceClass} custom-scrollbar min-h-0 overflow-y-auto border-b border-white/10 p-5 lg:border-b-0 lg:border-r`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="vn-label inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-black uppercase text-white/75">
                <MapPinned className="h-4 w-4 text-amber-200" />
                Địa điểm {location.mapLabel}/{totalLocations}
              </div>
              <p className="vn-label mt-4 text-xs font-black uppercase text-amber-200">
                {location.events.length} mốc sự kiện tại cùng vị trí
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/10 bg-white/5 text-white/70 transition hover:border-white/30 hover:text-white"
              aria-label="Đóng chi tiết địa điểm"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <h3 id="historical-location-title" className="mt-5 text-3xl font-black leading-tight md:text-4xl">
            {location.title}
          </h3>

          <p className="mt-3 inline-flex items-center gap-2 border border-white/10 bg-black/20 px-3 py-2 text-sm font-bold text-white/70">
            <MapPinned className="h-4 w-4 text-amber-200" />
            {location.place}
          </p>

          {featuredImage ? (
            <FeaturedImageSlot
              src={featuredImage.src}
              caption={featuredImage.caption}
              credit={featuredImage.credit}
              current={activeEventIndex + 1}
              total={location.events.length}
              surfaceClass={activeSurfaceClass}
              onPrev={() => selectEventByIndex(activeEventIndex - 1)}
              onNext={() => selectEventByIndex(activeEventIndex + 1)}
            />
          ) : null}

          <div className="mt-5 space-y-2">
            {location.events.map((event) => {
              const eventPhase = phaseById[event.phaseId];
              const active = event.id === activeEvent.id;

              return (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setActiveEventId(event.id)}
                  className={`w-full border p-3 text-left transition ${
                    active ? "border-amber-200 bg-amber-200 text-stone-950" : `${getPhaseSurfaceClass(event.phaseId)} border-white/10 text-white hover:border-white/35`
                  }`}
                >
                  <span className="vn-label flex items-center gap-2 text-[11px] font-black uppercase">
                    <span className="h-2 w-2 shrink-0" style={{ backgroundColor: eventPhase.color }} />
                    {String(event.order).padStart(2, "0")} · {event.date}
                  </span>
                  <span className="mt-2 block text-sm font-black leading-tight">{event.title}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="custom-scrollbar min-h-0 overflow-y-auto p-5 pb-8 md:p-6 md:pb-10">
          <div className="mb-5 flex flex-wrap gap-2 text-sm font-bold text-white/70">
            <span className="inline-flex items-center gap-2 border border-white/10 bg-black/20 px-3 py-2">
              <span className="h-2 w-2" style={{ backgroundColor: phase.color }} />
              {phase.title}
            </span>
            <span className="inline-flex items-center gap-2 border border-white/10 bg-black/20 px-3 py-2">
              <CalendarDays className="h-4 w-4" style={{ color: phase.color }} />
              {activeEvent.date}
            </span>
          </div>

          <h4 className="text-2xl font-black leading-tight md:text-3xl">{activeEvent.title}</h4>
          <p className="mt-4 text-base font-semibold leading-8 text-white/82">{activeEvent.summary}</p>

          <section className="mt-6 border-l-2 bg-white/[0.04] px-4 py-3" style={{ borderColor: phase.color }}>
            <div className="vn-label mb-2 flex items-center gap-2 text-xs font-black uppercase text-white">
              <ScrollText className="h-4 w-4" style={{ color: phase.color }} />
              Bối cảnh
            </div>
            <p className="text-sm leading-7 text-white/72">{activeEvent.context}</p>
          </section>

          <ContentBlock icon={FileText} title="Sự kiện tiêu biểu" color={phase.color}>
            <div className="space-y-2">
              {activeEvent.keyEvents.map((event) => (
                <ListRow key={event} color={phase.color} marker="check">
                  {event}
                </ListRow>
              ))}
            </div>
          </ContentBlock>

          <ContentBlock icon={BookOpen} title={activeEvent.methodTitle} color={phase.color}>
            <div className="space-y-2">
              {activeEvent.method.map((method) => (
                <ListRow key={method} color={phase.color} marker="dot">
                  {method}
                </ListRow>
              ))}
            </div>
          </ContentBlock>

          <div className="grid gap-4 md:grid-cols-2">
            <TextPanel title="Kết quả" color={phase.color}>
              {activeEvent.result}
            </TextPanel>
            <TextPanel title="Ý nghĩa" color={phase.color}>
              {activeEvent.meaning}
            </TextPanel>
          </div>

        </div>
      </motion.article>
    </div>
  );
}

function ContentBlock({
  icon: Icon,
  title,
  color,
  children,
}: {
  icon: LucideIcon;
  title: string;
  color: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-6 mt-6">
      <div className="vn-label mb-3 flex items-center gap-2 text-sm font-black uppercase text-white">
        <Icon className="h-4 w-4" style={{ color }} />
        {title}
      </div>
      {children}
    </section>
  );
}

function ListRow({
  children,
  color,
  marker,
}: {
  children: ReactNode;
  color: string;
  marker: "check" | "dot";
}) {
  return (
    <div className="flex gap-3 border border-white/10 bg-white/[0.04] px-3 py-3 text-sm leading-6 text-white/78">
      {marker === "check" ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
      ) : (
        <span className="mt-2 h-2 w-2 shrink-0" style={{ backgroundColor: color }} />
      )}
      <span>{children}</span>
    </div>
  );
}

function TextPanel({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: ReactNode;
}) {
  return (
    <section className="border border-white/10 bg-white/[0.04] p-4">
      <p className="vn-label text-[11px] font-black uppercase" style={{ color }}>
        {title}
      </p>
      <p className="mt-3 text-sm leading-7 text-white/74">{children}</p>
    </section>
  );
}

function FeaturedImageSlot({
  src,
  caption,
  credit,
  current,
  total,
  surfaceClass,
  onPrev,
  onNext,
}: {
  src: string;
  caption: string;
  credit?: string;
  current: number;
  total: number;
  surfaceClass: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <figure className={`${surfaceClass} mt-5 border border-white/10 p-3`}>
      <div className="relative">
        {failed ? (
          <div className="aspect-[16/10] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(247,223,114,0.12),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(0,0,0,0.32))]" aria-hidden="true" />
        ) : (
          <img src={src} alt={caption} className="aspect-[16/10] w-full object-cover" onError={() => setFailed(true)} />
        )}

        {total > 1 ? (
          <div className="absolute inset-x-2 top-1/2 flex -translate-y-1/2 items-center justify-between">
            <button
              type="button"
              onClick={onPrev}
              className="flex h-9 w-9 items-center justify-center border border-white/20 bg-black/65 text-white shadow-lg transition hover:bg-amber-200 hover:text-stone-950"
              aria-label="Xem mốc trước"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={onNext}
              className="flex h-9 w-9 items-center justify-center border border-white/20 bg-black/65 text-white shadow-lg transition hover:bg-amber-200 hover:text-stone-950"
              aria-label="Xem mốc tiếp theo"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ) : null}

        <div className="absolute bottom-2 right-2 border border-white/10 bg-black/70 px-2 py-1 text-[11px] font-bold text-white/80">
          {current}/{total}
        </div>
      </div>
      <figcaption className="mt-3 text-xs leading-5 text-white/68">
        {caption}
        {credit ? <span className="mt-1 block text-white/42">{credit}</span> : null}
      </figcaption>
    </figure>
  );
}

function getPhaseSurfaceClass(phaseId: RoutePhaseId) {
  return `learning-surface learning-surface--${phaseId}`;
}
