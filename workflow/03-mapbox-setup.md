# Setup Mapbox GL JS

## Env cần có

File `.env.local`:

```env
VITE_MAPBOX_TOKEN=pk_your_token_here
```

Trong Vite, biến env dùng ở frontend phải bắt đầu bằng `VITE_`.

Trong code:

```ts
const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
```

## Package cần cài

```bash
npm install mapbox-gl
```

Import trong component:

```ts
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
```

Gán token:

```ts
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
```

## Khởi tạo map cơ bản

```ts
const map = new mapboxgl.Map({
  container: mapContainer.current,
  style: "mapbox://styles/mapbox/dark-v11",
  center: [106.3, 16.3],
  zoom: 4.6,
  pitch: 48,
  bearing: -10,
});
```

## Bật terrain 3D nhẹ

```ts
map.addSource("mapbox-dem", {
  type: "raster-dem",
  url: "mapbox://mapbox.mapbox-terrain-dem-v1",
  tileSize: 512,
  maxzoom: 14,
});

map.setTerrain({
  source: "mapbox-dem",
  exaggeration: 1.25,
});
```

Terrain chỉ nên dùng nhẹ để tăng chiều sâu. Không nên exaggeration quá cao vì Việt Nam nhìn sẽ bị méo và mất tính học tập.

## Route line

Dữ liệu route nên là GeoJSON:

```ts
const routeGeoJson = {
  type: "Feature",
  geometry: {
    type: "LineString",
    coordinates: routePoints.map((point) => point.coordinates),
  },
  properties: {},
};
```

Layer line:

```ts
map.addLayer({
  id: "august-route-line",
  type: "line",
  source: "august-route",
  paint: {
    "line-color": "#f7df72",
    "line-width": 4,
    "line-opacity": 0.85,
  },
});
```

## Marker

Ban đầu có thể dùng DOM marker để dễ style:

```ts
const marker = new mapboxgl.Marker({ element })
  .setLngLat(point.coordinates)
  .addTo(map);
```

Sau này nếu marker nhiều hơn, chuyển sang GeoJSON circle/symbol layer.

## Popup/modal

Không nên dùng popup nhỏ mặc định cho nội dung dài. Nên:

- Marker click chỉ set `selectedPoint`.
- React render `EventDetailModal` bên ngoài map.
- Modal tự cuộn nội dung.
- Map chỉ giữ vai trò điều hướng và chọn mốc.

## Fallback khi thiếu token

Nếu chưa có token:

- Không crash app.
- Hiện panel hướng dẫn thêm `VITE_MAPBOX_TOKEN`.
- Có thể fallback về timeline grid cũ.

Thông báo gợi ý:

```txt
Thiếu VITE_MAPBOX_TOKEN. Thêm token Mapbox vào .env.local để bật bản đồ hành trình.
```

