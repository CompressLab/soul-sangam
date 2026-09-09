export const colors = {
  primary:   "#db2777",
  primary50: "#fdf2f8",
  primary100:"#fce7f3",
  primary700:"#be185d",
  secondary: "#f97316",
  white:     "#ffffff",
  gray50:    "#f9fafb",
  gray100:   "#f3f4f6",
  gray200:   "#e5e7eb",
  gray400:   "#9ca3af",
  gray500:   "#6b7280",
  gray700:   "#374151",
  gray900:   "#111827",
  green:     "#16a34a",
  red:       "#dc2626",
  amber:     "#d97706",
};

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};

export const radius = {
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,
};

export const typography = {
  h1:    { fontSize: 28, fontWeight: "700" as const, color: colors.gray900 },
  h2:    { fontSize: 22, fontWeight: "700" as const, color: colors.gray900 },
  h3:    { fontSize: 18, fontWeight: "600" as const, color: colors.gray900 },
  body:  { fontSize: 14, color: colors.gray700 },
  small: { fontSize: 12, color: colors.gray500 },
  label: { fontSize: 13, fontWeight: "500" as const, color: colors.gray700 },
};
