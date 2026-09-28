const MAX_STRING_LENGTH = 100;

const sanitizeParams = (params) => {
  if (!params) return undefined;
  const sanitized = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (typeof value === "boolean") {
      sanitized[key] = value ? 1 : 0;
    } else if (typeof value === "string") {
      sanitized[key] = value.slice(0, MAX_STRING_LENGTH);
    } else {
      sanitized[key] = value;
    }
  });
  return sanitized;
};

/** GA4へカスタムイベントを送信する。gtagが無い環境(テスト・広告ブロック等)では何もしない。 */
export const track = (name, params) => {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", name, sanitizeParams(params));
    }
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.debug("[track]", name, params);
    }
  } catch (error) {
    // 計測の失敗で画面側の動作を止めない
  }
};

const sentOnce = new Set();

/** 同一キーでの重複送信を、このセッション内で1度だけに抑える。 */
export const trackOnce = (key, name, params) => {
  if (sentOnce.has(key)) return;
  sentOnce.add(key);
  track(name, params);
};

export const EVENTS = Object.freeze({
  HIGHLIGHT_CREATE: "highlight_create",
  HIGHLIGHT_UPDATE: "highlight_update",
  HIGHLIGHT_DELETE: "highlight_delete",
});
