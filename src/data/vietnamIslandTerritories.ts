type VietnamIslandFeatureRole = "archipelago-label" | "archipelago-island" | "offshore-island";

type VietnamIslandPoint = {
  name: string;
  coordinates: [number, number];
  role: VietnamIslandFeatureRole;
  archipelago?: "Hoàng Sa" | "Trường Sa";
};

const islandPoints: VietnamIslandPoint[] = [
  // Các đảo, cụm đảo lớn dọc bờ biển Việt Nam.
  { name: "Cô Tô", coordinates: [107.766, 20.993], role: "offshore-island" },
  { name: "Bạch Long Vĩ", coordinates: [107.728, 20.133], role: "offshore-island" },
  { name: "Cát Bà", coordinates: [107.048, 20.802], role: "offshore-island" },
  { name: "Cồn Cỏ", coordinates: [107.337, 17.161], role: "offshore-island" },
  { name: "Lý Sơn", coordinates: [109.117, 15.383], role: "offshore-island" },
  { name: "Cù Lao Chàm", coordinates: [108.51, 15.95], role: "offshore-island" },
  { name: "Phú Quý", coordinates: [108.944, 10.53], role: "offshore-island" },
  { name: "Côn Đảo", coordinates: [106.606, 8.692], role: "offshore-island" },
  { name: "Hòn Khoai", coordinates: [104.82, 8.43], role: "offshore-island" },
  { name: "Nam Du", coordinates: [104.36, 9.69], role: "offshore-island" },
  { name: "Phú Quốc", coordinates: [103.97, 10.23], role: "offshore-island" },
  { name: "Thổ Chu", coordinates: [103.47, 9.3], role: "offshore-island" },

  // Quần đảo Hoàng Sa: nhãn trung tâm và các đảo tiêu biểu để quần đảo
  // vẫn hiện diện ở mức zoom toàn quốc, kể cả khi tileset nền bỏ sót.
  { name: "QĐ. HOÀNG SA\n(VIỆT NAM)", coordinates: [112.05, 16.42], role: "archipelago-label", archipelago: "Hoàng Sa" },
  { name: "Đảo Tri Tôn", coordinates: [111.202, 15.783], role: "archipelago-island", archipelago: "Hoàng Sa" },
  { name: "Đảo Quang Ảnh", coordinates: [111.502, 16.451], role: "archipelago-island", archipelago: "Hoàng Sa" },
  { name: "Đảo Hữu Nhật", coordinates: [111.581, 16.502], role: "archipelago-island", archipelago: "Hoàng Sa" },
  { name: "Đảo Hoàng Sa", coordinates: [111.616, 16.536], role: "archipelago-island", archipelago: "Hoàng Sa" },
  { name: "Đảo Quang Hòa", coordinates: [111.706, 16.448], role: "archipelago-island", archipelago: "Hoàng Sa" },
  { name: "Đảo Duy Mộng", coordinates: [111.737, 16.293], role: "archipelago-island", archipelago: "Hoàng Sa" },
  { name: "Đảo Phú Lâm", coordinates: [112.333, 16.833], role: "archipelago-island", archipelago: "Hoàng Sa" },
  { name: "Đảo Linh Côn", coordinates: [112.728, 16.665], role: "archipelago-island", archipelago: "Hoàng Sa" },

  // Quần đảo Trường Sa: các đảo/đá tiêu biểu trải trên toàn quần đảo.
  { name: "QĐ. TRƯỜNG SA\n(VIỆT NAM)", coordinates: [114.15, 10.02], role: "archipelago-label", archipelago: "Trường Sa" },
  { name: "Đảo Song Tử Tây", coordinates: [114.33, 11.432], role: "archipelago-island", archipelago: "Trường Sa" },
  { name: "Đảo Sơn Ca", coordinates: [114.479, 10.378], role: "archipelago-island", archipelago: "Trường Sa" },
  { name: "Đảo Nam Yết", coordinates: [114.365, 10.178], role: "archipelago-island", archipelago: "Trường Sa" },
  { name: "Đảo Sinh Tồn", coordinates: [114.328, 9.884], role: "archipelago-island", archipelago: "Trường Sa" },
  { name: "Đảo Phan Vinh", coordinates: [113.695, 8.97], role: "archipelago-island", archipelago: "Trường Sa" },
  { name: "Đảo Trường Sa", coordinates: [111.92, 8.644], role: "archipelago-island", archipelago: "Trường Sa" },
  { name: "Đảo An Bang", coordinates: [112.922, 7.888], role: "archipelago-island", archipelago: "Trường Sa" },
  { name: "Đá Tây", coordinates: [112.22, 8.85], role: "archipelago-island", archipelago: "Trường Sa" },
  { name: "Bãi Thuyền Chài", coordinates: [113.32, 8.18], role: "archipelago-island", archipelago: "Trường Sa" },
  { name: "Đảo Tiên Nữ", coordinates: [114.65, 8.875], role: "archipelago-island", archipelago: "Trường Sa" },
];

/**
 * Lớp điểm địa lý phục vụ hiển thị ở tỉ lệ toàn quốc. Các điểm không phải là
 * đường biên giới hay ranh giới vùng biển và không thay thế dữ liệu địa chính.
 */
export const vietnamIslandTerritories = {
  type: "FeatureCollection",
  features: islandPoints.map((point) => ({
    type: "Feature",
    properties: {
      name: point.name,
      role: point.role,
      archipelago: point.archipelago ?? "",
    },
    geometry: {
      type: "Point",
      coordinates: point.coordinates,
    },
  })),
};

export const vietnamTerritoryBounds: [[number, number], [number, number]] = [
  [102.0, 7.2],
  [115.4, 23.5],
];
