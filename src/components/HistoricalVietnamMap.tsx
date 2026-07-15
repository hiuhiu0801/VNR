import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import mapboxgl, { type ExpressionSpecification, type GeoJSONSource, type Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { AlertTriangle, ArrowRight, Layers3, MapPinned, Mountain, Route, Sparkles } from "lucide-react";
import { phaseById, routePhases, sortedHistoricalRoutePoints } from "../data/august1945Route";
import { vietnamIslandShapes } from "../data/vietnamIslandShapes";
import { vietnamIslandTerritories, vietnamTerritoryBounds } from "../data/vietnamIslandTerritories";
import type { HistoricalRoutePoint, RoutePhaseId } from "../types/august1945";
import { LocationDetailModal, type HistoricalRouteLocationDetail } from "./map/LocationDetailModal";

type HistoricalVietnamMapProps = {
  fallback?: ReactNode;
};

type PhaseFilter = RoutePhaseId | "all";

type RouteLocation = HistoricalRouteLocationDetail & {
  order: number;
  coordinates: [number, number];
  phaseIds: RoutePhaseId[];
  color: string;
  summary: string;
};

const initialCamera = {
  center: [106.25, 16.3] as [number, number],
  zoom: 4.85,
  pitch: 0,
  bearing: 0,
};

const vietnamFocusMaxBounds: [[number, number], [number, number]] = [
  [101.0, 6.2],
  [119.0, 24.2],
];

const routeLocations = buildRouteLocations(sortedHistoricalRoutePoints);

export function HistoricalVietnamMap({ fallback }: HistoricalVietnamMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const hasInitialMapFitRef = useRef(false);
  const [selectedLocation, setSelectedLocation] = useState<RouteLocation | null>(null);
  const [activeLocationId, setActiveLocationId] = useState(routeLocations[0]?.id ?? "");
  const [phaseFilter, setPhaseFilter] = useState<PhaseFilter>("all");
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined;

  const activeLocation = useMemo(
    () => routeLocations.find((location) => location.id === activeLocationId) ?? routeLocations[0],
    [activeLocationId],
  );

  const visibleLocations = useMemo(
    () => (phaseFilter === "all" ? routeLocations : routeLocations.filter((location) => location.phaseIds.includes(phaseFilter))),
    [phaseFilter],
  );

  useEffect(() => {
    if (!mapboxToken || !mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = mapboxToken;
    hasInitialMapFitRef.current = false;
    let resizeObserver: ResizeObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;
    const initialFitTimers: number[] = [];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: initialCamera.center,
      zoom: initialCamera.zoom,
      pitch: initialCamera.pitch,
      bearing: initialCamera.bearing,
      maxBounds: vietnamFocusMaxBounds,
      projection: "mercator",
      language: "vi",
      locale: {
        "NavigationControl.ZoomIn": "Phóng to",
        "NavigationControl.ZoomOut": "Thu nhỏ",
        "NavigationControl.ResetBearing": "Đặt lại hướng Bắc",
      },
      attributionControl: true,
    });

    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: false }), "bottom-right");

    const fitInitialMapView = (duration = 0) => {
      const container = mapContainerRef.current;
      if (!container || container.clientWidth < 320 || container.clientHeight < 360) return;

      map.resize();
      fitMapToLocations(map, routeLocations, duration);
      hasInitialMapFitRef.current = true;
    };

    resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        map.resize();
        if (!hasInitialMapFitRef.current) {
          fitInitialMapView(0);
        }
      });
    });
    resizeObserver.observe(mapContainerRef.current);

    intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasInitialMapFitRef.current) return;
        requestAnimationFrame(() => fitInitialMapView(0));
      },
      { threshold: 0.25 },
    );
    intersectionObserver.observe(mapContainerRef.current);

    map.on("load", () => {
      map.setFog(null);
      localizeBaseMapLabels(map);

      map.addSource("country-boundaries", {
        type: "vector",
        url: "mapbox://mapbox.country-boundaries-v1",
      });

      map.addLayer({
        id: "vietnam-fill",
        type: "fill",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        filter: [
          "all",
          ["==", ["get", "iso_3166_1_alpha_3"], "VNM"],
          ["any", ["==", ["get", "worldview"], "all"], ["!", ["in", "CN", ["get", "worldview"]]]],
        ],
        paint: {
          "fill-color": "#f7df72",
          "fill-opacity": 0.08,
        },
      });

      map.addLayer({
        id: "vietnam-outline",
        type: "line",
        source: "country-boundaries",
        "source-layer": "country_boundaries",
        filter: [
          "all",
          ["==", ["get", "iso_3166_1_alpha_3"], "VNM"],
          ["any", ["==", ["get", "worldview"], "all"], ["!", ["in", "CN", ["get", "worldview"]]]],
        ],
        paint: {
          "line-color": "#f7df72",
          "line-opacity": 0.55,
          "line-width": ["interpolate", ["linear"], ["zoom"], 4, 1.2, 8, 2.4],
        },
      });

      map.addSource("vietnam-island-territories", {
        type: "geojson",
        data: vietnamIslandTerritories as MapboxGeoJsonData,
      });

      map.addSource("vietnam-island-shapes", {
        type: "geojson",
        data: vietnamIslandShapes as MapboxGeoJsonData,
        attribution: 'Hình học đảo: © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
      });

      map.addLayer({
        id: "vietnam-island-shape-glow",
        type: "line",
        source: "vietnam-island-shapes",
        minzoom: 3.4,
        maxzoom: 7.2,
        paint: {
          "line-color": "#f7df72",
          "line-opacity": ["interpolate", ["linear"], ["zoom"], 3.4, 0.42, 7.2, 0.08],
          "line-width": ["interpolate", ["linear"], ["zoom"], 3.4, 3.2, 7.2, 2.2],
          "line-blur": ["interpolate", ["linear"], ["zoom"], 3.4, 1.3, 7.2, 0.6],
        },
      });

      map.addLayer({
        id: "vietnam-island-shape-fill",
        type: "fill",
        source: "vietnam-island-shapes",
        minzoom: 3.4,
        paint: {
          "fill-color": "#f7df72",
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 3.4, 0.5, 6.5, 0.34, 9, 0.52, 12, 0.72],
          "fill-outline-color": "#fff8d6",
        },
      });

      map.addLayer({
        id: "vietnam-island-shape-outline",
        type: "line",
        source: "vietnam-island-shapes",
        minzoom: 3.4,
        paint: {
          "line-color": "#fff1a8",
          "line-opacity": ["interpolate", ["linear"], ["zoom"], 3.4, 0.92, 6.5, 0.72, 9, 0.9],
          "line-width": ["interpolate", ["linear"], ["zoom"], 3.4, 1.4, 6.5, 1.05, 11, 1.8],
        },
      });

      map.addLayer({
        id: "vietnam-archipelago-label",
        type: "symbol",
        source: "vietnam-island-territories",
        maxzoom: 8.1,
        filter: ["==", ["get", "role"], "archipelago-label"],
        layout: {
          "text-field": ["get", "name"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 4, 10, 8, 12.5],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-anchor": "top",
          "text-offset": [0, 0.8],
          "text-line-height": 1.15,
          "text-letter-spacing": 0.04,
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": "#fff8d6",
          "text-halo-color": "#0d0b08",
          "text-halo-width": 1.5,
        },
      });

      map.addLayer({
        id: "vietnam-offshore-island-label",
        type: "symbol",
        source: "vietnam-island-territories",
        minzoom: 6.3,
        filter: ["==", ["get", "role"], "offshore-island"],
        layout: {
          "text-field": ["get", "name"],
          "text-size": 10.5,
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Regular"],
          "text-anchor": "top",
          "text-offset": [0, 0.8],
          "text-optional": true,
        },
        paint: {
          "text-color": "#fff8d6",
          "text-halo-color": "#0d0b08",
          "text-halo-width": 1.2,
        },
      });

      map.addLayer({
        id: "vietnam-archipelago-island-label",
        type: "symbol",
        source: "vietnam-island-territories",
        minzoom: 8.2,
        filter: ["==", ["get", "role"], "archipelago-island"],
        layout: {
          "text-field": ["get", "name"],
          "text-size": 10,
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Regular"],
          "text-anchor": "top",
          "text-offset": [0, 0.8],
          "text-optional": true,
        },
        paint: {
          "text-color": "#fff8d6",
          "text-halo-color": "#0d0b08",
          "text-halo-width": 1.2,
        },
      });

      map.addSource("august-points", {
        type: "geojson",
        data: buildPointCollection(visibleLocations),
      });

      map.addSource("august-point-active", {
        type: "geojson",
        data: buildPointCollection([routeLocations[0]]),
      });

      map.addLayer({
        id: "august-point-halo",
        type: "circle",
        source: "august-points",
        paint: {
          "circle-color": ["get", "phaseColor"],
          "circle-opacity": 0.2,
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 9, 8, 16],
          "circle-stroke-color": ["get", "phaseColor"],
          "circle-stroke-opacity": 0.35,
          "circle-stroke-width": 1,
        },
      });

      map.addLayer({
        id: "august-point-dot",
        type: "circle",
        source: "august-points",
        paint: {
          "circle-color": ["get", "phaseColor"],
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 3.5, 8, 6],
          "circle-stroke-color": "#fff8d6",
          "circle-stroke-width": 1.5,
        },
      });

      map.addLayer({
        id: "august-point-active",
        type: "circle",
        source: "august-point-active",
        paint: {
          "circle-color": "#fff8d6",
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 4, 7, 8, 12],
          "circle-stroke-color": "#f7df72",
          "circle-stroke-width": 4,
          "circle-opacity": 0.95,
        },
      });

      map.addLayer({
        id: "august-point-label",
        type: "symbol",
        source: "august-points",
        layout: {
          "text-field": ["get", "mapLabel"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 4, 10, 8, 13],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-allow-overlap": true,
          "text-ignore-placement": true,
        },
        paint: {
          "text-color": "#fff8d6",
          "text-halo-color": "#0d0b08",
          "text-halo-width": 1.4,
        },
      });

      const openLocationFromFeature = (event: mapboxgl.MapLayerMouseEvent) => {
        const feature = event.features?.[0] as { properties?: { id?: string } } | undefined;
        const id = feature?.properties?.id;
        const location = routeLocations.find((item) => item.id === id);
        if (!location) return;
        setActiveLocationId(location.id);
        setSelectedLocation(location);
        flyToLocation(location);
      };

      ["august-point-halo", "august-point-dot", "august-point-label"].forEach((layerId) => {
        map.on("mouseenter", layerId, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layerId, () => {
          map.getCanvas().style.cursor = "";
        });
        map.on("click", layerId, openLocationFromFeature);
      });

      requestAnimationFrame(() => fitInitialMapView(0));
      map.once("idle", () => fitInitialMapView(0));
      [80, 240, 600].forEach((delay) => {
        initialFitTimers.push(window.setTimeout(() => fitInitialMapView(0), delay));
      });
      setMapReady(true);
    });

    map.on("error", (event) => {
      const message = event.error?.message || "Không thể tải Mapbox. Kiểm tra token và kết nối mạng.";
      setMapError(message);
    });

    return () => {
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      initialFitTimers.forEach((timer) => window.clearTimeout(timer));
      map.remove();
      mapRef.current = null;
    };
  }, [mapboxToken]);

  useEffect(() => {
    const pointsSource = mapRef.current?.getSource("august-points") as GeoJSONSource | undefined;
    pointsSource?.setData(buildPointCollection(visibleLocations));

    const pointSource = mapRef.current?.getSource("august-point-active") as GeoJSONSource | undefined;
    const activeLocationFeature = visibleLocations.find((location) => location.id === activeLocationId) ?? visibleLocations[0] ?? routeLocations[0];
    pointSource?.setData(buildPointCollection([activeLocationFeature]));
  }, [activeLocationId, visibleLocations]);

  const handlePhaseSelect = (phase: PhaseFilter) => {
    setPhaseFilter(phase);
    const map = mapRef.current;
    const nextLocations = phase === "all" ? routeLocations : routeLocations.filter((location) => location.phaseIds.includes(phase));
    if (nextLocations[0]) {
      setActiveLocationId(nextLocations[0].id);
    }
    if (!map) return;

    if (phase === "all") {
      fitMapToLocations(map, routeLocations, 900);
      return;
    }

    fitMapToLocations(map, nextLocations, 900);
  };

  const flyToLocation = (location: RouteLocation) => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: location.coordinates,
      zoom: 8.5,
      pitch: 0,
      bearing: 0,
      duration: 900,
      essential: true,
    });
  };

  if (!mapboxToken) {
    return <MapboxFallback fallback={fallback} />;
  }

  return (
    <section id="route" className="bg-stone-950 px-5 py-16 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 grid gap-5 md:grid-cols-[0.9fr_1.1fr] md:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-amber-200">Bản đồ hành trình Việt Nam</p>
            <h2 className="mt-3 text-3xl font-black uppercase leading-tight md:text-5xl">Từ chuẩn bị lực lượng đến bảo vệ thành quả</h2>
          </div>
          <p className="text-base leading-7 text-white/70">
            Bấm từng địa điểm để mở nội dung học tập chi tiết. Các marker nối theo tiến trình lịch sử từ Việt Bắc, Tân Trào, Hà Nội,
            Huế, Sài Gòn đến giai đoạn xây dựng và bảo vệ chính quyền mới.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className={`${getPhaseSurfaceClass(phaseFilter)} border border-white/10 p-4`}>
            <div className="vn-label mb-4 flex items-center gap-2 text-sm font-black uppercase">
              <Layers3 className="h-4 w-4 text-amber-200" />
              4 giai đoạn
            </div>
            <div className="space-y-2">
              <PhaseButton
                active={phaseFilter === "all"}
                label="Toàn bộ hành trình"
                subLabel={`${routeLocations.length} địa điểm · ${sortedHistoricalRoutePoints.length} mốc`}
                color="#ffffff"
                surfaceClass={getPhaseSurfaceClass("all")}
                onClick={() => handlePhaseSelect("all")}
              />
              {routePhases.map((phase) => (
                <PhaseButton
                  key={phase.id}
                  active={phaseFilter === phase.id}
                  label={phase.title}
                  subLabel={`${phase.label} · ${phase.period}`}
                  color={phase.color}
                  surfaceClass={getPhaseSurfaceClass(phase.id)}
                  onClick={() => handlePhaseSelect(phase.id)}
                />
              ))}
            </div>

            <div className="mt-5 border-t border-white/10 pt-4">
              <div className="vn-label mb-2 flex items-center gap-2 text-xs font-black uppercase text-white/55">
                <Route className="h-4 w-4 text-amber-200" />
                Đang xem
              </div>
              <p className="text-lg font-black leading-tight">{activeLocation?.title}</p>
              <p className="mt-2 text-sm leading-6 text-white/60">{activeLocation?.summary}</p>
            </div>
          </aside>

          <div className="historical-map-shell relative min-h-[680px] overflow-hidden border border-white/10 bg-black md:min-h-[760px]">
            <div ref={mapContainerRef} className="absolute inset-0" />

            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-stone-950/90 to-transparent p-4">
              <div className="vn-label flex flex-wrap items-center gap-2 text-[11px] font-black uppercase text-white/65">
                <Mountain className="h-4 w-4 text-amber-200" />
                Bản đồ Việt Nam
                <span className="text-white/25">/</span>
                Điểm địa danh theo timeline
                <span className="text-white/25">/</span>
                Popup học tập đầy đủ
              </div>
            </div>

            <div className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-xs border border-white/10 bg-black/65 px-3 py-2 text-xs font-semibold leading-5 text-white/70 backdrop-blur">
              <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full border border-white bg-amber-200 align-middle" />
              Số tròn là địa điểm lịch sử; mỗi popup có thể chứa nhiều mốc cùng vị trí.
            </div>

            {!mapReady && !mapError && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-stone-950">
                <div className="text-center">
                  <Sparkles className="mx-auto h-8 w-8 animate-pulse text-amber-200" />
                  <p className="vn-label mt-4 text-sm font-black uppercase text-white/70">Đang dựng bản đồ lịch sử</p>
                </div>
              </div>
            )}

            {mapError && (
              <div className="absolute inset-0 z-30 flex items-center justify-center bg-stone-950/92 p-5">
                <div className="max-w-lg border border-red-300/30 bg-red-950/30 p-5">
                  <div className="vn-label flex items-center gap-2 text-sm font-black uppercase text-red-200">
                    <AlertTriangle className="h-5 w-5" />
                    Mapbox chưa tải được
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/70">{mapError}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {visibleLocations.map((location) => (
            <button
              key={location.id}
              type="button"
              onClick={() => {
                setActiveLocationId(location.id);
                setSelectedLocation(location);
                flyToLocation(location);
              }}
              className={`border p-3 text-left transition ${
                activeLocationId === location.id ? "border-amber-200 bg-amber-200 text-stone-950" : `${getLocationSurfaceClass(location)} border-white/10 text-white hover:border-white/30`
              }`}
            >
              <span className="vn-label text-[11px] font-black uppercase opacity-70">
                Địa điểm {location.mapLabel} · {location.events.length} mốc
              </span>
              <span className="mt-2 block text-sm font-black leading-tight">{location.title}</span>
            </button>
          ))}
        </div>
      </div>

      {selectedLocation && (
        <LocationDetailModal
          location={selectedLocation}
          totalLocations={routeLocations.length}
          onClose={() => setSelectedLocation(null)}
        />
      )}
    </section>
  );
}

function PhaseButton({
  active,
  label,
  subLabel,
  color,
  surfaceClass,
  onClick,
}: {
  active: boolean;
  label: string;
  subLabel: string;
  color: string;
  surfaceClass: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${active ? "" : surfaceClass} flex w-full items-center gap-3 border p-3 text-left transition ${
        active ? "border-white/45 bg-white text-stone-950" : "border-white/10 text-white hover:border-white/35"
      }`}
    >
      <span className="h-9 w-1.5 shrink-0" style={{ backgroundColor: color }} />
      <span className="min-w-0">
        <span className="block text-sm font-black leading-tight">{label}</span>
        <span className={`mt-1 block text-xs font-semibold ${active ? "text-stone-600" : "text-white/58"}`}>{subLabel}</span>
      </span>
    </button>
  );
}

function getPhaseSurfaceClass(phase: PhaseFilter) {
  return `learning-surface learning-surface--${phase}`;
}

function getLocationSurfaceClass(location: RouteLocation) {
  if (location.phaseIds.length === 1) return getPhaseSurfaceClass(location.phaseIds[0]);
  return getPhaseSurfaceClass("all");
}

function MapboxFallback({ fallback }: { fallback?: ReactNode }) {
  return (
    <section id="route" className="bg-stone-950 px-5 py-16 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="border border-amber-200/35 bg-amber-200/10 p-5">
          <div className="flex items-start gap-3">
            <MapPinned className="mt-1 h-5 w-5 shrink-0 text-amber-200" />
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">Cần Mapbox token</p>
              <h2 className="mt-2 text-2xl font-black">Thêm `VITE_MAPBOX_TOKEN` để bật bản đồ học tập</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">
                Tạo token public trong Mapbox, thêm vào `.env.local`, rồi restart dev server. Khi chưa có token, app vẫn hiển thị
                timeline fallback bên dưới.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 border border-white/10 bg-black/25 px-3 py-2 text-sm font-bold text-white/80">
                VITE_MAPBOX_TOKEN=pk_your_token_here
                <ArrowRight className="h-4 w-4 text-amber-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
      {fallback}
    </section>
  );
}

type MapboxGeoJsonData = Parameters<GeoJSONSource["setData"]>[0];

const vietnameseBaseLabelLayerIds = [
  "waterway-label",
  "natural-line-label",
  "natural-point-label",
  "water-line-label",
  "water-point-label",
  "settlement-subdivision-label",
  "settlement-minor-label",
  "settlement-major-label",
  "state-label",
  "country-label",
  "continent-label",
] as const;

const hiddenBaseLayerIds = ["road-label-simple", "poi-label", "airport-label", "admin-0-boundary-disputed"] as const;

const replacedArchipelagoLabels = [
  "Hoàng Sa",
  "Quần đảo Hoàng Sa",
  "Trường Sa",
  "Quần đảo Trường Sa",
  "Tam Sa",
  "Thành phố Tam Sa",
  "Tây Sa",
  "Quận Tây Sa",
  "Nam Sa",
  "Quận Nam Sa",
  "Vĩnh Hưng",
  "Đảo Vĩnh Hưng",
  "Đảo Phú Lâm",
];

function localizeBaseMapLabels(map: MapboxMap) {
  hiddenBaseLayerIds.forEach((layerId) => {
    if (map.getLayer(layerId)) {
      map.setLayoutProperty(layerId, "visibility", "none");
    }
  });

  const vietnameseTextField: ExpressionSpecification = [
    "case",
    ["in", ["coalesce", ["get", "name_vi"], ""], ["literal", replacedArchipelagoLabels]],
    "",
    ["coalesce", ["get", "name_vi"], ""],
  ];

  vietnameseBaseLabelLayerIds.forEach((layerId) => {
    if (!map.getLayer(layerId)) return;
    map.setLayoutProperty(layerId, "text-field", vietnameseTextField);
  });
}

function buildRouteLocations(points: HistoricalRoutePoint[]): RouteLocation[] {
  const groups = new Map<string, HistoricalRoutePoint[]>();

  points.forEach((point) => {
    const key = coordinateKey(point.coordinates);
    groups.set(key, [...(groups.get(key) ?? []), point]);
  });

  return Array.from(groups.entries())
    .map(([key, events]) => {
      const sortedEvents = [...events].sort((a, b) => a.order - b.order);
      const firstEvent = sortedEvents[0];
      const phaseIds = Array.from(new Set(sortedEvents.map((event) => event.phaseId)));
      const order = Math.min(...sortedEvents.map((event) => event.order));
      const color = phaseIds.length === 1 ? phaseById[phaseIds[0]].color : "#f7df72";

      return {
        id: `location-${key.replace(/[.,-]/g, "-")}`,
        order,
        mapLabel: "",
        title: locationTitleForKey(key, sortedEvents),
        place: locationPlaceForKey(key, sortedEvents),
        coordinates: firstEvent.coordinates,
        phaseIds,
        color,
        summary:
          sortedEvents.length === 1
            ? sortedEvents[0].summary
            : `${sortedEvents.length} mốc tại cùng địa điểm: ${sortedEvents.map((event) => `${String(event.order).padStart(2, "0")} ${event.title}`).join("; ")}.`,
        events: sortedEvents,
      };
    })
    .sort((a, b) => a.order - b.order)
    .map((location, index) => ({
      ...location,
      mapLabel: String(index + 1).padStart(2, "0"),
    }));
}

function coordinateKey(coordinates: [number, number]) {
  return `${coordinates[0].toFixed(3)},${coordinates[1].toFixed(3)}`;
}

function locationTitleForKey(key: string, events: HistoricalRoutePoint[]) {
  const knownTitles: Record<string, string> = {
    "106.252,22.842": "Pác Bó, Cao Bằng",
    "105.401,21.811": "Việt Bắc - Tân Trào",
    "105.854,21.028": "Hà Nội và phạm vi toàn quốc",
    "106.700,10.776": "Sài Gòn - Chợ Lớn",
  };

  return knownTitles[key] ?? events[0].place;
}

function locationPlaceForKey(key: string, events: HistoricalRoutePoint[]) {
  const knownPlaces: Record<string, string> = {
    "106.252,22.842": "Pác Bó, Cao Bằng",
    "105.401,21.811": "Việt Bắc / Tân Trào",
    "105.854,21.028": "Hà Nội / toàn quốc",
    "106.700,10.776": "Sài Gòn - Chợ Lớn",
  };

  return knownPlaces[key] ?? events[0].place;
}

function fitMapToLocations(map: MapboxMap, locations: RouteLocation[], duration: number) {
  const bounds = new mapboxgl.LngLatBounds(vietnamTerritoryBounds[0], vietnamTerritoryBounds[1]);

  if (locations.length > 0 && locations.length < routeLocations.length) {
    const phaseBounds = new mapboxgl.LngLatBounds(locations[0].coordinates, locations[0].coordinates);
    locations.forEach((location) => phaseBounds.extend(location.coordinates));
    map.fitBounds(phaseBounds, {
      padding: { top: 92, right: 92, bottom: 92, left: 92 },
      maxZoom: locations.length === 1 ? 8.8 : 7.3,
      pitch: 0,
      bearing: 0,
      duration,
    });
    return;
  }

  map.fitBounds(bounds, {
    padding: { top: 84, right: 84, bottom: 84, left: 84 },
    pitch: 0,
    bearing: 0,
    duration,
  });
}

function buildPointCollection(locations: RouteLocation[]): MapboxGeoJsonData {
  return {
    type: "FeatureCollection",
    features: locations.map((location) => ({
      type: "Feature",
      properties: {
        id: location.id,
        order: location.order,
        mapLabel: location.mapLabel,
        title: location.title,
        phase: location.phaseIds.join(","),
        phaseColor: location.color,
      },
      geometry: {
        type: "Point",
        coordinates: location.coordinates,
      },
    })),
  } as MapboxGeoJsonData;
}
