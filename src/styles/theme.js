export const COLORS = {
  primary:      "#C8507A",
  primaryDark:  "#A33660",
  primaryLight: "#FDF0F5",
  accent:       "#FF9E4A",
  accentLight:  "#FFF5EC",
  gold:         "#C9993A",
  dark:         "#1C0D14",
  text:         "#2D1820",
  muted:        "#8A6070",
  bg:           "#FFFAF8",
  surface:      "#FFFFFF",
  border:       "#EDD8E2",
  green:        "#1E9E62",
};

export const FONTS = {
  serif: "'Palatino Linotype', Palatino, Georgia, serif",
};

export const GLOBAL_CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { margin: 0; font-family: 'Palatino Linotype', Palatino, Georgia, serif; background: ${COLORS.bg}; }
  input, button, select { font-family: inherit; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
  .gv-toast {
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: ${COLORS.dark};
    color: #fff;
    padding: 10px 22px;
    border-radius: 24px;
    font-size: 13px;
    font-weight: 600;
    z-index: 9999;
    white-space: nowrap;
    box-shadow: 0 4px 24px rgba(0,0,0,.25);
    animation: gvFadeUp .3s ease;
  }
  @keyframes gvFadeUp {
    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  @media (max-width: 767px) { .gv-toast { bottom: 76px; } }
`;

/** Reusable style helpers — call as functions with COLORS in scope */
export const styleHelpers = (C) => ({
  btn: (variant = "primary") => ({
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
    padding: variant === "sm" ? "7px 16px" : "11px 22px",
    borderRadius: variant === "pill" ? 30 : 10,
    fontSize: variant === "sm" ? 13 : 14,
    fontWeight: 700, cursor: "pointer", border: "none", fontFamily: "inherit", transition: "all .18s",
    background:
      variant === "outline" ? "transparent"
      : variant === "ghost"   ? C.primaryLight
      : `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`,
    color:  variant === "outline" || variant === "ghost" ? C.primary : "#fff",
    border: variant === "outline" ? `1.5px solid ${C.primary}` : "none",
  }),

  badge: (color = "") => ({
    background: color || C.primary,
    color: "#fff", fontSize: 9, fontWeight: 700,
    padding: "3px 8px", borderRadius: 20,
    letterSpacing: ".4px", textTransform: "uppercase", display: "inline-block",
  }),

  tag: (bg = "", col = "") => ({
    background: bg || C.primaryLight,
    color: col || C.primary,
    fontSize: 11, fontWeight: 700,
    padding: "4px 10px", borderRadius: 20,
    border: `1px solid ${C.border}`, display: "inline-block",
  }),

  pill: (active) => ({
    padding: "7px 16px", borderRadius: 30,
    border: `1.5px solid ${active ? C.primary : C.border}`,
    background: active ? C.primary : C.surface,
    color: active ? "#fff" : C.muted,
    fontSize: 13, fontWeight: 600, cursor: "pointer",
    fontFamily: "inherit", transition: "all .18s", whiteSpace: "nowrap",
  }),

  card: {
    background: C.surface, borderRadius: 16, overflow: "hidden",
    border: `1px solid ${C.border}`,
    boxShadow: "0 2px 12px rgba(200,80,122,0.06)",
    cursor: "pointer", transition: "transform .2s, box-shadow .2s",
    display: "flex", flexDirection: "column",
  },
});
