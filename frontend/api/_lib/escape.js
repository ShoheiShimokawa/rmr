const ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** HTMLのテキスト・属性へ安全に埋め込むために値をエスケープします。 */
export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ESCAPE_MAP[ch]);
}

/** 指定した長さを超える場合は末尾を省略記号に置き換えて切り詰めます。 */
export function truncate(value, maxLength) {
  const str = String(value ?? "").trim();
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 1)}…`;
}
