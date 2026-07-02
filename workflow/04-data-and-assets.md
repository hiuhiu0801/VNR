# Dữ liệu và ảnh tư liệu

## Kiểu dữ liệu đề xuất

```ts
export type RoutePhaseId = "prepare" | "opportunity" | "uprising" | "protect";

export type HistoricalRouteImage = {
  src: string;
  caption: string;
  year?: string;
  credit?: string;
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
};
```

## Danh sách mốc gợi ý

| Order | Giai đoạn | Ngày | Mốc | Địa điểm |
| --- | --- | --- | --- | --- |
| 1 | Chuẩn bị lực lượng | 1939-1941 | Chuyển hướng chiến lược | Việt Bắc / Trung ương Đảng |
| 2 | Chuẩn bị lực lượng | 19/5/1941 | Mặt trận Việt Minh ra đời | Pác Bó, Cao Bằng |
| 3 | Chớp thời cơ | 9/3/1945 | Nhật đảo chính Pháp | Đông Dương |
| 4 | Chớp thời cơ | 12/3/1945 | Chỉ thị hành động | Ban Thường vụ Trung ương |
| 5 | Chớp thời cơ | 13-16/8/1945 | Quyết định Tổng khởi nghĩa | Tân Trào |
| 6 | Giành chính quyền | 16/8/1945 | Quân giải phóng xuất phát | Tân Trào - Thái Nguyên |
| 7 | Giành chính quyền | 19/8/1945 | Giành chính quyền ở Hà Nội | Hà Nội |
| 8 | Giành chính quyền | 23/8/1945 | Giành chính quyền ở Huế | Huế |
| 9 | Giành chính quyền | 25/8/1945 | Khởi nghĩa thắng lợi ở Sài Gòn | Sài Gòn |
| 10 | Bảo vệ thành quả | 2/9/1945 | Tuyên ngôn Độc lập | Ba Đình, Hà Nội |
| 11 | Bảo vệ thành quả | 25/11/1945 | Kháng chiến kiến quốc | Toàn quốc / Hà Nội |

Tọa độ cần kiểm tra lại trước khi code. Dùng dạng `[longitude, latitude]`.

## Tọa độ nháp để bắt đầu

```ts
const draftCoordinates = {
  pacBo: [106.252, 22.842],
  tanTrao: [105.401, 21.811],
  thaiNguyen: [105.844, 21.594],
  haNoi: [105.854, 21.028],
  hue: [107.590, 16.463],
  saiGon: [106.700, 10.776],
};
```

Các tọa độ này chỉ dùng để dựng prototype. Khi hoàn thiện nên kiểm tra lại bằng nguồn bản đồ.

## Cách thêm ảnh tư liệu cho từng mốc

1. Đưa ảnh vào:

```txt
public/images/august1945/
```

2. Đặt tên file rõ nghĩa:

```txt
ha-noi-1945.jpg
tan-trao-dinh-hong-thai.jpg
sai-gon-25-8-1945.jpg
ba-dinh-2-9-1945.jpg
```

3. Gắn vào data:

```ts
images: [
  {
    src: "/images/august1945/ha-noi-1945.jpg",
    caption: "Quần chúng Hà Nội trong những ngày Tổng khởi nghĩa tháng 8/1945.",
    year: "1945",
    credit: "Nguồn ảnh cần bổ sung",
  },
],
```

4. Component modal hiển thị ảnh:

```tsx
{point.images.map((image) => (
  <figure key={image.src}>
    <img src={image.src} alt={image.caption} />
    <figcaption>{image.caption}</figcaption>
  </figure>
))}
```

## Cách thêm bản đồ Việt Nam cũ phủ lên Mapbox

Khi có ảnh bản đồ cũ đã biết 4 góc tọa độ:

```ts
map.addSource("historical-map", {
  type: "image",
  url: "/images/maps/indochina-1945.jpg",
  coordinates: [
    [102.0, 23.5],
    [110.0, 23.5],
    [110.0, 8.0],
    [102.0, 8.0],
  ],
});

map.addLayer({
  id: "historical-map-layer",
  type: "raster",
  source: "historical-map",
  paint: {
    "raster-opacity": 0.28,
  },
});
```

Nếu ảnh chưa khớp bản đồ thật:

- Georeference bằng QGIS.
- Export thành GeoTIFF hoặc tile.
- Upload thành tileset trên Mapbox.
- Add source từ tileset đó vào app.

## Quy tắc nguồn ảnh

- Ưu tiên ảnh từ bảo tàng, thư viện, cơ quan báo chí/chính phủ, tư liệu lịch sử có nguồn rõ.
- Ghi caption trung tính, không phóng đại.
- Nếu chưa chắc nguồn, để `credit: "Nguồn cần xác minh"` thay vì ghi bừa.
- Với ảnh chỉ để học nội bộ, vẫn nên giữ nguồn để sau này thay bằng tư liệu sạch hơn.

