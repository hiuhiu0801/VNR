import { useEffect, useState, type CSSProperties } from "react";
import {
  BadgeCheck,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flag,
  Image,
  Maximize2,
  ScrollText,
  Sparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import type { ImageSlot, SessionBlock, SessionEventDetail } from "../types/august1945";

type SessionExplorerProps = {
  sessions: SessionBlock[];
  getSessionEventDetail: (session: SessionBlock, event: string, index: number) => SessionEventDetail;
};

const phaseMeta = [
  {
    label: "Giai đoạn 1",
    name: "Chuẩn bị lực lượng",
    tone: "Đặt nền độc lập dân tộc, hình thành lực lượng chính trị - vũ trang - căn cứ địa.",
    surfaceClass: "learning-surface learning-surface--prepare",
  },
  {
    label: "Giai đoạn 2",
    name: "Chớp thời cơ",
    tone: "Nhận diện kẻ thù trực tiếp, biến cao trào kháng Nhật thành cuộc tập dượt lớn.",
    surfaceClass: "learning-surface learning-surface--opportunity",
  },
  {
    label: "Giai đoạn 3",
    name: "Giành chính quyền",
    tone: "Hành động nhanh, rộng, đúng lúc để đưa chính quyền về tay nhân dân.",
    surfaceClass: "learning-surface learning-surface--uprising",
  },
  {
    label: "Giai đoạn 4",
    name: "Bảo vệ thành quả",
    tone: "Củng cố nhà nước mới, xử lý thù trong giặc ngoài và giữ vững độc lập.",
    surfaceClass: "learning-surface learning-surface--protect",
  },
];

export function SessionExplorer({ sessions, getSessionEventDetail }: SessionExplorerProps) {
  const [activeId, setActiveId] = useState(sessions[0].id);
  const [selectedEvent, setSelectedEvent] = useState<SessionEventDetail | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ title: string; caption: string; src: string } | null>(null);
  const active = sessions.find((session) => session.id === activeId) || sessions[0];
  const Icon = active.icon;
  const activeIndex = Math.max(0, sessions.findIndex((session) => session.id === active.id));
  const activePhase = phaseMeta[activeIndex] || phaseMeta[0];
  const sectionStyle = { "--phase-bg": `url(${active.heroImage})` } as CSSProperties;

  useEffect(() => {
    setSelectedEvent(null);
    setSelectedImage(null);
  }, [activeId]);

  return (
    <section id="sessions" className="phase-cinematic-section bg-stone-100 px-5 py-12 dark:bg-stone-950 md:px-8" style={sectionStyle}>
      <div className="relative z-10 mx-auto max-w-7xl">
        <div className="mb-10 grid gap-5 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-red-700 dark:text-amber-200">Chủ đề trọng tâm</p>
            <h2 className="mt-3 text-3xl font-black uppercase leading-tight text-stone-950 dark:text-white md:text-5xl">
              4 giai đoạn của Cách mạng Tháng Tám
            </h2>
          </div>
          <p className="text-base leading-7 text-stone-600 dark:text-stone-300">
            Chủ đề được tổ chức như một hành trình liền mạch: chuẩn bị lực lượng, chớp thời cơ, giành chính quyền và bảo vệ thành quả. Mỗi giai đoạn có mốc then chốt, nội dung cốt lõi và cửa sổ chi tiết để người học đọc sâu khi cần.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="grid gap-3 lg:block lg:space-y-3">
            {sessions.map((session, index) => {
              const SessionIcon = session.icon;
              const isActive = session.id === active.id;
              const phase = phaseMeta[index] || phaseMeta[0];
              return (
                <button
                  key={session.id}
                  type="button"
                  onClick={() => setActiveId(session.id)}
                  className={`w-full border p-4 text-left transition ${
                    isActive
                      ? "border-red-700 bg-white shadow-sm dark:border-amber-200 dark:bg-white/[0.08]"
                      : `border-stone-200 bg-white/70 hover:border-red-300 dark:border-white/10 dark:hover:border-amber-200/50 ${phase.surfaceClass}`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center ${isActive ? "bg-red-700 text-white dark:bg-amber-200 dark:text-stone-950" : "bg-stone-100 text-stone-700 dark:bg-white/10 dark:text-stone-200"}`}>
                      <SessionIcon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-xs font-black uppercase tracking-[0.16em] text-red-700 dark:text-amber-200">{phase.label}</span>
                      <span className="block text-sm font-black text-stone-950 dark:text-white">{phase.name}</span>
                      <span className="block text-xs font-semibold text-stone-500 dark:text-stone-400">{session.period}</span>
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-bold leading-5 text-stone-700 dark:text-stone-200">{phase.tone}</p>
                </button>
              );
            })}
          </div>

          <motion.article
            key={active.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border border-stone-200 bg-white shadow-sm dark:border-white/10 dark:bg-stone-900"
          >
            <div className="grid md:grid-cols-[0.9fr_1.1fr]">
              <div className="relative min-h-[320px]">
                <img src={active.heroImage} alt={active.title} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/20 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center border border-amber-200/40 bg-black/35 text-amber-100 backdrop-blur">
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-amber-100">{activePhase.label}</p>
                  <h3 className="mt-2 text-3xl font-black uppercase leading-tight text-white">{activePhase.name}</h3>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-white/75">Chủ đề Cách mạng Tháng Tám 1945</p>
                </div>
              </div>

              <div className="p-6 md:p-8">
                <p className={`text-xs font-black uppercase tracking-[0.2em] ${active.accent}`}>{active.period}</p>
                <p className="mt-3 text-xl font-black leading-7 text-stone-950 dark:text-white">{active.tagline}</p>
                <p className="mt-3 border-l-2 border-red-700 bg-stone-50 px-4 py-3 text-sm font-semibold leading-6 text-stone-700 dark:border-amber-200 dark:bg-white/[0.04] dark:text-stone-200">
                  {activePhase.tone}
                </p>
                <p className="mt-4 text-sm leading-7 text-stone-600 dark:text-stone-300">{active.summary}</p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <InfoList title="Năng lực cần đạt" items={active.outcomes} icon={BadgeCheck} />
                  <InfoList title="Trọng tâm kiến thức" items={active.keyIdeas} icon={ScrollText} />
                </div>
              </div>
            </div>

            <div className="border-t border-stone-200 p-5 dark:border-white/10 md:p-6">
              <SectionMiniTitle icon={Clock3} title="Mốc then chốt trong giai đoạn" />
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {active.events.map((event, index) => {
                  const eventDetail = getSessionEventDetail(active, event, index);

                  return (
                    <button
                      key={event}
                      type="button"
                      onClick={() => setSelectedEvent(eventDetail)}
                      className="group min-h-24 border-l-2 border-red-700 bg-stone-50 px-4 py-3 text-left text-sm font-semibold text-stone-700 transition hover:bg-white hover:shadow-sm dark:border-amber-200 dark:bg-white/[0.04] dark:text-stone-200 dark:hover:bg-white/[0.08]"
                    >
                      <span className="block leading-6">{event}</span>
                      <span className="mt-2 block text-xs font-bold text-stone-500 transition group-hover:text-red-700 dark:text-stone-400 dark:group-hover:text-amber-200">
                        Bấm để xem nội dung sự kiện
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-stone-200 p-5 dark:border-white/10 md:p-6">
              <SectionMiniTitle icon={Image} title="Tư liệu hình ảnh cho giai đoạn" />
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {active.imageSlots.map((slot) => (
                  <ImagePlaceholder
                    key={slot.title}
                    slot={slot}
                    surfaceClass={activePhase.surfaceClass}
                    fallbackSrc={active.heroImage}
                    onOpen={(src) => setSelectedImage({ title: slot.title, caption: slot.caption, src })}
                  />
                ))}
              </div>
            </div>
          </motion.article>

          {selectedEvent && (
            <SessionEventWindow
              detail={selectedEvent}
              phaseLabel={activePhase.label}
              surfaceClass={activePhase.surfaceClass}
              onClose={() => setSelectedEvent(null)}
            />
          )}

          {selectedImage && <ImageLightbox image={selectedImage} onClose={() => setSelectedImage(null)} />}
        </div>
      </div>
    </section>
  );
}

function SessionEventWindow({
  detail,
  phaseLabel,
  surfaceClass,
  onClose,
}: {
  detail: SessionEventDetail;
  phaseLabel: string;
  surfaceClass: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.22 }}
        className="relative w-full max-w-3xl overflow-hidden border border-stone-200 bg-white text-stone-950 shadow-2xl dark:border-white/10 dark:bg-stone-950 dark:text-white"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="session-event-title"
      >
        <header className="flex items-start justify-between gap-4 border-b border-stone-200 bg-stone-50 px-5 py-4 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-700 dark:text-amber-200">
              {phaseLabel} / Mốc sự kiện
            </p>
            <h3 id="session-event-title" className="mt-2 text-2xl font-black uppercase leading-tight">
              {detail.title}
            </h3>
            <p className="mt-2 text-sm font-semibold text-stone-500 dark:text-stone-400">{detail.event}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-stone-200 text-stone-500 transition hover:border-red-700 hover:text-red-700 dark:border-white/10 dark:text-stone-300 dark:hover:border-amber-200 dark:hover:text-amber-200"
            aria-label="Đóng cửa sổ tư liệu"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="grid max-h-[72vh] overflow-y-auto md:grid-cols-[0.95fr_1.05fr]">
          <div className="border-b border-stone-200 bg-stone-100 p-4 dark:border-white/10 dark:bg-stone-900 md:border-b-0 md:border-r">
            <div className="overflow-hidden border border-stone-200 bg-white dark:border-white/10 dark:bg-white/[0.04]">
              <div className="relative aspect-[4/3] bg-stone-200 dark:bg-stone-800">
                {detail.imageSrc ? (
                  <img src={detail.imageSrc} alt={detail.imageTitle} className="h-full w-full object-cover" />
                ) : (
                  <div className={`h-full ${surfaceClass}`} aria-hidden="true" />
                )}
              </div>
              <div className="p-4">
                <p className="text-sm font-black">{detail.imageTitle}</p>
                <p className="mt-2 text-xs leading-5 text-stone-600 dark:text-stone-300">{detail.imageCaption}</p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5">
            <section>
              <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-stone-950 dark:text-white">
                <ScrollText className="h-4 w-4 text-red-700 dark:text-amber-200" />
                Trong giai đoạn này
              </div>
              <p className="text-sm leading-7 text-stone-700 dark:text-stone-300">{detail.overview}</p>
            </section>

            <EventList title="Sự kiện tiêu biểu" icon={Flag} items={detail.milestones} marker="check" />
            <EventList title={detail.methodTitle} icon={BookOpen} items={detail.methods} marker="arrow" />

            <section className="border-l-2 border-red-700 bg-red-50 px-4 py-3 dark:border-amber-200 dark:bg-amber-200/10">
              <div className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-stone-950 dark:text-white">
                <Sparkles className="h-4 w-4 text-red-700 dark:text-amber-200" />
                Kết quả - ý nghĩa
              </div>
              <p className="text-sm leading-7 text-stone-700 dark:text-stone-200">{detail.result}</p>
            </section>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function EventList({
  title,
  icon: Icon,
  items,
  marker,
}: {
  title: string;
  icon: LucideIcon;
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
            className="flex gap-2 border border-stone-200 bg-stone-50 px-3 py-2 text-sm leading-6 text-stone-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-300"
          >
            {marker === "check" ? (
              <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-red-700 dark:text-amber-200" />
            ) : (
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-red-700 dark:text-amber-200" />
            )}
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function InfoList({
  title,
  items,
  icon: Icon,
}: {
  title: string;
  items: string[];
  icon: LucideIcon;
}) {
  return (
    <div className="border border-stone-200 bg-stone-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
      <div className="mb-3 flex items-center gap-2 text-sm font-black text-stone-950 dark:text-white">
        <Icon className="h-4 w-4 text-red-700 dark:text-amber-200" />
        {title}
      </div>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
            <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-red-700 dark:text-amber-200" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SectionMiniTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.16em] text-stone-950 dark:text-white">
      <Icon className="h-4 w-4 text-red-700 dark:text-amber-200" />
      {title}
    </div>
  );
}

function ImagePlaceholder({
  slot,
  surfaceClass,
  fallbackSrc,
  onOpen,
}: {
  slot: ImageSlot;
  surfaceClass: string;
  fallbackSrc: string;
  onOpen: (src: string) => void;
}) {
  const src = slot.src || fallbackSrc;

  return (
    <button
      type="button"
      onClick={() => onOpen(src)}
      className="group overflow-hidden border border-stone-200 bg-stone-50 text-left transition hover:border-red-500 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-amber-200"
    >
      <div className="relative aspect-[4/3] bg-stone-200 dark:bg-stone-800">
        {slot.src ? (
          <img src={slot.src} alt={slot.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.04]" />
        ) : (
          <div className={`h-full ${surfaceClass}`} aria-hidden="true" />
        )}
        <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center border border-white/20 bg-black/65 text-white opacity-0 transition group-hover:opacity-100">
          <Maximize2 className="h-4 w-4" />
        </span>
      </div>
      <div className="p-4">
        <p className="text-sm font-black text-stone-950 dark:text-white">{slot.title}</p>
        <p className="mt-2 text-xs leading-5 text-stone-600 dark:text-stone-300">{slot.caption}</p>
      </div>
    </button>
  );
}

function ImageLightbox({
  image,
  onClose,
}: {
  image: { title: string; caption: string; src: string };
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/78 p-4 backdrop-blur-md" onClick={onClose}>
      <motion.figure
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-5xl border border-white/10 bg-stone-950 p-3 text-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center border border-white/15 bg-black/70 text-white/75 transition hover:border-white/35 hover:text-white"
          aria-label="Đóng ảnh tư liệu"
        >
          <X className="h-5 w-5" />
        </button>
        <img src={image.src} alt={image.title} className="max-h-[76vh] w-full object-contain" />
        <figcaption className="border-t border-white/10 px-2 py-4">
          <p className="text-base font-black">{image.title}</p>
          <p className="mt-2 text-sm leading-6 text-white/68">{image.caption}</p>
        </figcaption>
      </motion.figure>
    </div>
  );
}
