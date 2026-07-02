import type { LucideIcon } from "lucide-react";

export type ImageSlot = {
  title: string;
  caption: string;
  src?: string;
  pathHint: string;
};

export type SessionEventDetail = {
  event: string;
  title: string;
  overview: string;
  milestones: string[];
  methodTitle: string;
  methods: string[];
  result: string;
  imageTitle: string;
  imageCaption: string;
  imageHint: string;
  imageSrc?: string;
};

export type SessionEventDetailSeed = Omit<SessionEventDetail, "event">;

export type SessionBlock = {
  id: string;
  session: string;
  period: string;
  title: string;
  tagline: string;
  icon: LucideIcon;
  heroImage: string;
  accent: string;
  summary: string;
  outcomes: string[];
  keyIdeas: string[];
  events: string[];
  imageSlots: ImageSlot[];
  questions: string[];
};

export type UprisingEvent = {
  id: string;
  date: string;
  phase: string;
  place: string;
  title: string;
  route: string;
  note: string;
  overview: string;
  highlights: string[];
  implementationTitle: string;
  implementation: string[];
  meaning: string;
  session: string;
  imageHint: string;
};

export type RoutePhaseId = "prepare" | "opportunity" | "uprising" | "protect";

export type HistoricalRouteImage = {
  src: string;
  caption: string;
  year?: string;
  credit?: string;
};

export type HistoricalRoutePhase = {
  id: RoutePhaseId;
  label: string;
  title: string;
  period: string;
  summary: string;
  color: string;
  camera: {
    center: [number, number];
    zoom: number;
    pitch: number;
    bearing: number;
  };
};

export type HistoricalRoutePoint = {
  id: string;
  phaseId: RoutePhaseId;
  order: number;
  date: string;
  title: string;
  place: string;
  coordinates: [number, number];
  summary: string;
  context: string;
  keyEvents: string[];
  methodTitle: string;
  method: string[];
  result: string;
  meaning: string;
  images: HistoricalRouteImage[];
  sourceNote: string;
};

export type FlipPage = {
  label: string;
  title: string;
  body: string;
  bullets: string[];
};
