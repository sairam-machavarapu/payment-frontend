// Fixed colors for well-known special categories
const FIXED_COLORS = [
  '#534AB7', '#EF9F27', '#1D9E75', '#378ADD',
  '#D4537E', '#E24B4A', '#8B5CF6', '#F59E0B',
  '#10B981', '#3B82F6', '#EC4899', '#6366F1',
];

const FIXED_BG = [
  '#EEEDFE', '#FAEEDA', '#E1F5EE', '#E6F1FB',
  '#FBEAF0', '#FCEBEB', '#EDE9FE', '#FEF3C7',
  '#D1FAE5', '#DBEAFE', '#FCE7F3', '#E0E7FF',
];

const FIXED_TEXT = [
  '#3C3489', '#633806', '#085041', '#0C447C',
  '#72243E', '#791F1F', '#5B21B6', '#92400E',
  '#065F46', '#1E40AF', '#9D174D', '#3730A3',
];

// Cache so the same category always gets the same color within a session
const _colorCache = new Map();

function _assignColor(name) {
  if (_colorCache.has(name)) return _colorCache.get(name);
  const idx = _colorCache.size % FIXED_COLORS.length;
  const entry = {
    color: FIXED_COLORS[idx],
    bg: FIXED_BG[idx],
    textColor: FIXED_TEXT[idx],
    icon: '📁',
  };
  _colorCache.set(name, entry);
  return entry;
}

// Static overrides for special categories that are always present
const STATIC_OVERRIDES = {
  'Payment':       { color: '#1D9E75', bg: '#E1F5EE', textColor: '#085041', icon: '💳' },
  'Refund/Credit': { color: '#378ADD', bg: '#E6F1FB', textColor: '#0C447C', icon: '💰' },
  'Others':        { color: '#888780', bg: '#F1EFE8', textColor: '#444441', icon: '📦' },
};

/**
 * Returns { color, bg, textColor, icon } for any category name.
 * Known special categories use static overrides; all others get a
 * deterministically assigned color from the palette.
 */
export function getCategoryStyle(name) {
  if (STATIC_OVERRIDES[name]) return STATIC_OVERRIDES[name];
  return _assignColor(name);
}

/**
 * Seed the color cache from a list of category names fetched from the API.
 * Call this once after /api/categories responds so all colors are stable.
 */
export function seedCategoryColors(names) {
  names.forEach((name) => {
    if (!STATIC_OVERRIDES[name]) _assignColor(name);
  });
}

// Legacy named exports kept for backward compat with chart code
export const CATEGORY_COLORS = new Proxy({}, {
  get(_, name) {
    return getCategoryStyle(name)?.color ?? '#888780';
  },
});

export const BADGE_STYLES = new Proxy({}, {
  get(_, name) {
    const s = getCategoryStyle(name);
    return { bg: s.bg, color: s.textColor, icon: s.icon };
  },
});
