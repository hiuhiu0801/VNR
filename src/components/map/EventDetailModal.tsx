import { useEffect, useState, type ReactNode } from "react";
import { BookOpen, CalendarDays, CheckCircle2, FileText, MapPinned, ScrollText, X, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import type { HistoricalRoutePoint } from "../../types/august1945";

type EventDetailModalProps = {
  point: HistoricalRoutePoint;
  phaseTitle: string;
  phaseColor: string;
  total: number;
  onClose: () => void;
};

export function EventDetailModal({ point, phaseTitle, phaseColor, total, onClose }: EventDetailModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const featuredImage = point.images[0];
  const surfaceClass = getPhaseSurfaceClassFromColor(phaseColor);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/65 p-3 backdrop-blur-md md:p-5" onClick={onClose}>
      <motion.article
        key={point.id}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ duration: 0.2 }}
        className="relative grid max-h-[88vh] w-full max-w-6xl overflow-hidden border border-white/10 bg-stone-950 text-white shadow-2xl lg:grid-cols-[0.92fr_1.08fr]"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="historical-point-title"
      >
        <aside className={`${surfaceClass} custom-scrollbar min-h-0 overflow-y-auto border-b border-white/10 p-5 lg:border-b-0 lg:border-r`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white/75">
                <span className="h-2 w-2" style={{ backgroundColor: phaseColor }} />
                {phaseTitle}
              </div>
              <p className="mt-4 text-xs font-black uppercase tracking-[0.2em]" style={{ color: phaseColor }}>
                Mốc {point.order}/{total} · {point.date}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center border border-white/10 bg-white/5 text-white/70 transition hover:border-white/30 hover:text-white"
              aria-label="Đóng chi tiết sự kiện"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <h3 id="historical-point-title" className="mt-5 text-3xl font-black leading-tight md:text-4xl">
            {point.title}
          </h3>

          <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold text-white/70">
            <span className="inline-flex items-center gap-2 border border-white/10 bg-black/20 px-3 py-2">
              <MapPinned className="h-4 w-4" style={{ color: phaseColor }} />
              {point.place}
            </span>
            <span className="inline-flex items-center gap-2 border border-white/10 bg-black/20 px-3 py-2">
              <CalendarDays className="h-4 w-4" style={{ color: phaseColor }} />
              {point.date}
            </span>
          </div>

          {featuredImage ? (
            <FeaturedPointImage src={featuredImage.src} caption={featuredImage.caption} credit={featuredImage.credit} surfaceClass={surfaceClass} />
          ) : null}

          <p className="mt-5 text-base font-semibold leading-8 text-white/82">{point.summary}</p>

          <section className="mt-6 border-l-2 bg-white/[0.04] px-4 py-3" style={{ borderColor: phaseColor }}>
            <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-white">
              <ScrollText className="h-4 w-4" style={{ color: phaseColor }} />
              Bối cảnh
            </div>
            <p className="text-sm leading-7 text-white/72">{point.context}</p>
          </section>
        </aside>

        <div className="custom-scrollbar min-h-0 overflow-y-auto p-5 md:p-6">
          <ContentBlock icon={FileText} title="Sự kiện tiêu biểu" color={phaseColor}>
            <div className="space-y-2">
              {point.keyEvents.map((event) => (
                <ListRow key={event} color={phaseColor} marker="check">
                  {event}
                </ListRow>
              ))}
            </div>
          </ContentBlock>

          <ContentBlock icon={BookOpen} title={point.methodTitle} color={phaseColor}>
            <div className="space-y-2">
              {point.method.map((method) => (
                <ListRow key={method} color={phaseColor} marker="dot">
                  {method}
                </ListRow>
              ))}
            </div>
          </ContentBlock>

          <div className="grid gap-4 md:grid-cols-2">
            <TextPanel title="Kết quả" color={phaseColor}>
              {point.result}
            </TextPanel>
            <TextPanel title="Ý nghĩa" color={phaseColor}>
              {point.meaning}
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
    <section className="mb-6">
      <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-white">
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
    <div className="flex gap-3 border border-white/10 bg-white/[0.04] px-3 py-3 text-sm leading-6 text-white/75">
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

function FeaturedPointImage({ src, caption, credit, surfaceClass }: { src: string; caption: string; credit?: string; surfaceClass: string }) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  return (
    <figure className={`${surfaceClass} mt-5 border border-white/10 p-3`}>
      {failed ? (
        <div className="aspect-[16/10] border border-white/10 bg-[radial-gradient(circle_at_center,rgba(247,223,114,0.12),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.06),rgba(0,0,0,0.32))]" aria-hidden="true" />
      ) : (
        <img src={src} alt={caption} className="aspect-[16/10] w-full object-cover" onError={() => setFailed(true)} />
      )}
      <figcaption className="mt-3 text-xs leading-5 text-white/62">
        {caption}
        {credit ? <span className="mt-1 block text-white/38">{credit}</span> : null}
      </figcaption>
    </figure>
  );
}

function getPhaseSurfaceClassFromColor(color: string) {
  const normalized = color.toLowerCase();
  if (normalized === "#ef4444") return "learning-surface learning-surface--opportunity";
  if (normalized === "#22c55e") return "learning-surface learning-surface--uprising";
  if (normalized === "#38bdf8") return "learning-surface learning-surface--protect";
  return "learning-surface learning-surface--prepare";
}
