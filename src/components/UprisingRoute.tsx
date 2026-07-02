import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Flag,
  MapPinned,
  ScrollText,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import type { UprisingEvent } from "../types/august1945";

type UprisingRouteProps = {
  events: UprisingEvent[];
};

export function UprisingRoute({ events }: UprisingRouteProps) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [activeId, setActiveId] = useState(events[0].id);
  const [selectedEvent, setSelectedEvent] = useState<UprisingEvent | null>(null);
  const [columns, setColumns] = useState(3);
  const active = events.find((event) => event.id === activeId) || events[0];
  const activeIndex = Math.max(0, events.findIndex((event) => event.id === active.id));

  useEffect(() => {
    const target = timelineRef.current;
    if (!target) return;

    const updateColumns = () => {
      const width = target.getBoundingClientRect().width;
      if (width < 640) {
        setColumns(1);
      } else if (width < 1024) {
        setColumns(2);
      } else {
        setColumns(3);
      }
    };

    updateColumns();
    const observer = new ResizeObserver(updateColumns);
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  const rows = useMemo(() => {
    const nextRows: UprisingEvent[][] = [];
    for (let index = 0; index < events.length; index += columns) {
      nextRows.push(events.slice(index, index + columns));
    }
    return nextRows;
  }, [columns, events]);

  return (
    <section id="route" className="bg-white px-5 py-16 dark:bg-stone-900 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-red-700 dark:text-amber-200">Hành trình Tổng khởi nghĩa</p>
            <h2 className="mt-3 text-3xl font-black uppercase leading-tight text-stone-950 dark:text-white md:text-5xl">
              Đi từ đâu tới đâu?
            </h2>
          </div>
          <p className="text-base leading-7 text-stone-600 dark:text-stone-300">
            Timeline đi từ chuyển hướng chiến lược, tập hợp lực lượng, cao trào kháng Nhật, quyết định ở Tân Trào, giành chính quyền tại các trung tâm lớn, đến Tuyên ngôn Độc lập và nhiệm vụ giữ chính quyền.
          </p>
        </div>

        <div
          ref={timelineRef}
          className="relative min-w-0 overflow-hidden border border-stone-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-[#17130f]"
          style={{ perspective: "1600px" }}
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(220,38,38,0.10),transparent_30%),radial-gradient(circle_at_82%_35%,rgba(250,204,21,0.10),transparent_28%),linear-gradient(rgba(120,113,108,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(120,113,108,0.08)_1px,transparent_1px)] bg-[length:auto,auto,42px_42px,42px_42px]" />
          <div className="relative mb-4 flex flex-wrap items-center justify-between gap-3 border border-stone-200 bg-white/70 px-4 py-3 dark:border-white/10 dark:bg-black/20">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-red-700 dark:text-amber-200">Bản đồ hành trình</p>
              <p className="mt-1 text-sm font-bold text-stone-700 dark:text-stone-300">11 mốc / 4 giai đoạn / đường nối ngắn nhất theo timeline</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-stone-500 dark:text-stone-400">
              <span className="h-2 w-2 bg-red-700 dark:bg-amber-200" />
              Bấm từng mốc để mở chi tiết
            </div>
          </div>

          <div className="relative space-y-0">
              {rows.map((row, rowIndex) => {
                const rowStartIndex = rowIndex * columns;
                const isReverseRow = rowIndex % 2 === 1 && columns > 1;
                const displayRow = isReverseRow ? [...row].reverse() : row;
                const leadingEmptyCount = isReverseRow ? columns - row.length : 0;
                const trailingEmptyCount = isReverseRow ? 0 : columns - row.length;
                const visualSlots: Array<UprisingEvent | null> = [
                  ...Array.from({ length: leadingEmptyCount }, () => null),
                  ...displayRow,
                  ...Array.from({ length: trailingEmptyCount }, () => null),
                ];

                return (
                  <div key={row.map((event) => event.id).join("-")}>
                    <div
                      className="grid gap-5"
                      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
                    >
                      {visualSlots.map((event, columnIndex) => {
                        if (!event) return <div key={`empty-${rowIndex}-${columnIndex}`} className="hidden sm:block" />;

                        const eventIndex = events.findIndex((item) => item.id === event.id);
                        const isActive = event.id === active.id;
                        const isPassed = eventIndex <= activeIndex;
                        const isLastInChronologicalRow = eventIndex === rowStartIndex + row.length - 1;
                        const isLastEvent = eventIndex === events.length - 1;
                        const connectorDirection = isReverseRow ? "left" : "right";

                        return (
                          <TimelineCard
                            key={event.id}
                            event={event}
                            index={eventIndex}
                            isActive={isActive}
                            isPassed={isPassed}
                            showConnector={!isLastInChronologicalRow && !isLastEvent}
                            connectorDirection={connectorDirection}
                            onClick={() => {
                              setActiveId(event.id);
                              setSelectedEvent(event);
                            }}
                          />
                        );
                      })}
                    </div>

                    {rowIndex < rows.length - 1 && <TimelineRowBridge columns={columns} side={rowIndex % 2 === 0 ? "right" : "left"} />}
                  </div>
                );
              })}
          </div>
        </div>

        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            activeIndex={Math.max(0, events.findIndex((event) => event.id === selectedEvent.id))}
            total={events.length}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </div>
    </section>
  );
}

function TimelineCard({
  event,
  index,
  isActive,
  isPassed,
  showConnector,
  connectorDirection,
  onClick,
}: {
  event: UprisingEvent;
  index: number;
  isActive: boolean;
  isPassed: boolean;
  showConnector: boolean;
  connectorDirection: "left" | "right";
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="group relative text-left">
      {showConnector && connectorDirection === "right" && (
        <span className="pointer-events-none absolute left-[calc(100%+0.1rem)] top-10 z-10 hidden h-px w-[1rem] bg-red-700/65 dark:bg-amber-200/70 sm:block">
          <ArrowRight className="absolute -right-1.5 -top-2 h-4 w-4 text-red-700 dark:text-amber-200" />
        </span>
      )}

      {showConnector && connectorDirection === "left" && (
        <span className="pointer-events-none absolute right-[calc(100%+0.1rem)] top-10 z-10 hidden h-px w-[1rem] bg-red-700/65 dark:bg-amber-200/70 sm:block">
          <ArrowLeft className="absolute -left-1.5 -top-2 h-4 w-4 text-red-700 dark:text-amber-200" />
        </span>
      )}

      <span
        className={`block min-h-[142px] border p-3 shadow-[0_12px_30px_rgba(0,0,0,0.06)] transition duration-200 will-change-transform group-hover:-translate-y-1 group-hover:shadow-[0_18px_45px_rgba(0,0,0,0.14)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.24)] ${
          isActive
            ? "border-red-700 bg-white dark:border-amber-200 dark:bg-white/[0.08]"
            : "border-stone-200 bg-white/92 hover:border-red-400 hover:bg-white dark:border-white/10 dark:bg-white/[0.045] dark:hover:border-amber-200"
        }`}
      >
        <span
          className={`mb-3 flex h-8 w-8 items-center justify-center border text-[11px] font-black ${
            isActive
              ? "border-red-700 bg-red-700 text-white dark:border-amber-200 dark:bg-amber-200 dark:text-stone-950"
              : isPassed
                ? "border-red-700 bg-red-50 text-red-700 dark:border-amber-200 dark:bg-amber-200/10 dark:text-amber-200"
                : "border-stone-300 bg-stone-100 text-stone-500 dark:border-white/15 dark:bg-stone-900 dark:text-stone-400"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <span className="flex flex-wrap items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.13em] text-red-700 dark:text-amber-200">
          <span>{event.date}</span>
          <span className="text-stone-300 dark:text-white/20">/</span>
          <span>{event.phase}</span>
        </span>
        <span className="mt-2 block text-base font-black leading-tight text-stone-950 dark:text-white">{event.title}</span>
        <span className="mt-2 block text-xs font-semibold leading-5 text-stone-500 dark:text-stone-400">{event.place}</span>
        <span className="mt-3 inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-red-700 opacity-0 transition group-hover:opacity-100 dark:text-amber-200">
          Mở chi tiết
          <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </span>
    </button>
  );
}

function TimelineRowBridge({ columns, side }: { columns: number; side: "left" | "right" }) {
  if (columns === 1) {
    return (
      <div className="relative h-7">
        <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-red-700/50 dark:bg-amber-200/55" />
        <ArrowDown className="absolute bottom-1 left-1/2 h-4 w-4 -translate-x-1/2 text-red-700 dark:text-amber-200" />
      </div>
    );
  }

  const edgeOffset = `${100 / (columns * 2)}%`;
  const edgeStyle = side === "right" ? { right: edgeOffset } : { left: edgeOffset };

  return (
    <div className="relative h-7">
      <span className="absolute top-0 h-full w-px bg-red-700/55 dark:bg-amber-200/65" style={edgeStyle} />
      <ArrowDown
        className={`absolute bottom-0 h-4 w-4 text-red-700 dark:text-amber-200 ${side === "right" ? "translate-x-1/2" : "-translate-x-1/2"}`}
        style={edgeStyle}
      />
    </div>
  );
}

function EventDetailModal({
  event,
  activeIndex,
  total,
  onClose,
}: {
  event: UprisingEvent;
  activeIndex: number;
  total: number;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        key={event.id}
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22 }}
        className="relative w-full max-w-5xl overflow-hidden border border-stone-200 bg-stone-50 text-stone-950 shadow-2xl dark:border-white/10 dark:bg-stone-950 dark:text-white"
        onClick={(clickEvent) => clickEvent.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="route-event-title"
      >
        <header className="flex items-start justify-between gap-4 border-b border-stone-200 bg-white px-5 py-4 dark:border-white/10 dark:bg-white/[0.05]">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700 dark:text-amber-200">
              Bước {activeIndex + 1}/{total} · {event.phase}
            </p>
            <h3 id="route-event-title" className="mt-2 text-2xl font-black leading-tight text-stone-950 dark:text-white md:text-3xl">
              {event.title}
            </h3>
            <p className="mt-2 text-sm font-semibold text-stone-500 dark:text-stone-400">{event.date} / {event.place}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-stone-200 text-stone-500 transition hover:border-red-700 hover:text-red-700 dark:border-white/10 dark:text-stone-300 dark:hover:border-amber-200 dark:hover:text-amber-200"
            aria-label="Đóng chi tiết lộ trình"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid max-h-[78vh] overflow-y-auto lg:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-stone-200 bg-stone-100 p-5 dark:border-white/10 dark:bg-stone-900 lg:border-b-0 lg:border-r">
            <div className="mb-5 flex h-12 w-12 items-center justify-center bg-red-700 text-white dark:bg-amber-200 dark:text-stone-950">
              <MapPinned className="h-5 w-5" />
            </div>
            <EventImagePanel srcHint={event.imageHint} title={event.title} />
            <DetailSection icon={ScrollText} title="Bối cảnh và nội dung chính">
              <p className="text-sm leading-7 text-stone-700 dark:text-stone-300">{event.overview}</p>
            </DetailSection>

            <section className="mt-5 border-l-2 border-red-700 bg-white px-4 py-3 dark:border-amber-200 dark:bg-stone-950/40">
              <div className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-stone-950 dark:text-white">
                <Sparkles className="h-4 w-4 text-red-700 dark:text-amber-200" />
                Kết quả - ý nghĩa
              </div>
              <p className="text-sm leading-7 text-stone-700 dark:text-stone-200">{event.meaning}</p>
            </section>
          </div>

          <div className="space-y-5 p-5">
            <DetailList icon={Flag} title="Diễn biến tiêu biểu" items={event.highlights} marker="check" />
            <DetailList icon={BookOpen} title={event.implementationTitle} items={event.implementation} marker="arrow" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function EventImagePanel({ srcHint, title }: { srcHint: string; title: string }) {
  const [failed, setFailed] = useState(false);
  const src = srcHint.replace(/^public\//, "/");

  useEffect(() => {
    setFailed(false);
  }, [srcHint]);

  return (
    <figure className="mb-5 overflow-hidden border border-stone-200 bg-white dark:border-white/10 dark:bg-stone-950/40">
      {failed ? (
        <div className="aspect-[16/10] bg-[radial-gradient(circle_at_center,rgba(185,28,28,0.12),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.72),rgba(245,245,244,0.42))] dark:bg-[radial-gradient(circle_at_center,rgba(247,223,114,0.12),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.28))]" aria-hidden="true" />
      ) : (
        <img src={src} alt={title} className="aspect-[16/10] w-full object-cover" onError={() => setFailed(true)} />
      )}
    </figure>
  );
}

function DetailSection({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-stone-950 dark:text-white">
        <Icon className="h-4 w-4 text-red-700 dark:text-amber-200" />
        {title}
      </div>
      {children}
    </section>
  );
}

function DetailList({
  icon: Icon,
  title,
  items,
  marker,
}: {
  icon: LucideIcon;
  title: string;
  items: string[];
  marker: "check" | "arrow";
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-stone-950 dark:text-white">
        <Icon className="h-4 w-4 text-red-700 dark:text-amber-200" />
        {title}
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item}
            className="flex gap-2 border border-stone-200 bg-white px-3 py-2 text-sm leading-6 text-stone-700 dark:border-white/10 dark:bg-stone-950/40 dark:text-stone-300"
          >
            {marker === "check" ? (
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-red-700 dark:text-amber-200" />
            ) : (
              <CalendarDays className="mt-1 h-4 w-4 shrink-0 text-red-700 dark:text-amber-200" />
            )}
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
