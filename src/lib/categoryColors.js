const SPECIAL_COLORS = {
  "no-pollen-debris": "#9c9c94",
  unknown_pollen: "#e0703b",
};

// Deterministic per-category color so the same species always gets the same
// swatch across images and sessions, without needing to store colors anywhere.
export function colorForCategory(categoryName) {
  if (SPECIAL_COLORS[categoryName]) return SPECIAL_COLORS[categoryName];
  let hash = 0;
  for (let i = 0; i < categoryName.length; i++) {
    hash = (hash * 31 + categoryName.charCodeAt(i)) % 360;
  }
  return `hsl(${hash}, 70%, 45%)`;
}
