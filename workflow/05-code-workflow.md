# Workflow code

## Nguyên tắc trước khi sửa code

- Không xóa `UprisingRoute` cũ ngay khi chưa có bản đồ chạy ổn.
- Tạo component mới rồi thay thế sau.
- Data lịch sử để trong `src/data`, không nhồi thêm vào component.
- Component map chỉ lo render map, marker, route và tương tác.
- Modal/popup chỉ lo hiển thị nội dung sự kiện.
- CSS phải responsive từ đầu.

## Bước 1: Cài package và env

```bash
npm install mapbox-gl
```

Thêm `.env.local`:

```env
VITE_MAPBOX_TOKEN=pk_your_token_here
```

Thêm `.env.example`:

```env
VITE_MAPBOX_TOKEN=
```

## Bước 2: Tạo data route

Tạo:

```txt
src/data/august1945Route.ts
```

File này chứa:

- `routePhases`
- `historicalRoutePoints`
- helper tạo GeoJSON route nếu cần

Không import Mapbox trong data file.

## Bước 3: Tạo component bản đồ

Tạo:

```txt
src/components/HistoricalVietnamMap.tsx
```

Nhiệm vụ:

- Khởi tạo Mapbox map.
- Add terrain.
- Add route source/layer.
- Add markers.
- Handle click marker.
- Render phase controls.
- Render `EventDetailModal`.

## Bước 4: Tách modal

Tạo:

```txt
src/components/map/EventDetailModal.tsx
```

Nhiệm vụ:

- Nhận `point`.
- Hiển thị context, key events, method, result, meaning.
- Hiển thị gallery ảnh tư liệu.
- Có nút đóng.
- Trap layout bằng `max-height` và `overflow-y-auto`.

## Bước 5: Tách controls nếu cần

Tạo:

```txt
src/components/map/MapPhaseTabs.tsx
src/components/map/MapLegend.tsx
```

Nhiệm vụ:

- Chọn 4 giai đoạn.
- Hiển thị chú thích màu.
- Khi chọn giai đoạn, filter marker/line hoặc fly camera đến khu vực liên quan.

## Bước 6: Gắn vào app

Trong `App.tsx`, thay phần:

```tsx
<UprisingRoute events={uprisingEvents} />
```

bằng:

```tsx
<HistoricalVietnamMap />
```

Hoặc trong giai đoạn thử nghiệm:

```tsx
{mapboxToken ? <HistoricalVietnamMap /> : <UprisingRoute events={uprisingEvents} />}
```

## Bước 7: Thêm hiệu ứng hành trình

Sau khi map chạy ổn mới thêm:

- Line glow.
- Active route segment.
- Marker pulse.
- Camera fly-to khi chọn giai đoạn/mốc.
- Overlay ảnh bản đồ cũ.

Không thêm hiệu ứng trước khi dữ liệu và popup đúng.

## Bước 8: Cleanup

Khi bản đồ đã ổn:

- Xóa hoặc giữ `UprisingRoute` làm fallback tùy quyết định.
- Dọn data cũ khỏi `App.tsx`.
- Đảm bảo import không thừa.
- Chạy lint/build.

## Thứ tự commit đề xuất

Nếu có commit:

1. `docs: add mapbox workflow`
2. `feat: add august 1945 route data`
3. `feat: add historical vietnam map`
4. `feat: add event detail modal and image gallery`
5. `feat: add route effects and historical overlay`
6. `test: verify map layout and build`

