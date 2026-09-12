/**
 * `/:handle` ルートとして扱われるべきではない、フロントエンドの予約済みトップレベルパス。
 * ここに含まれるハンドルはプロフィールとして解決せず、通常のSPAへフォールバックさせる。
 */
const RESERVED_HANDLES = new Set([
  "login",
  "book",
  "analytics",
  "information",
  "postregister",
  "handleregister",
  "notifications",
  "highlights",
  "api",
]);

export function isReservedHandle(handle) {
  return !handle || RESERVED_HANDLES.has(String(handle).toLowerCase());
}

function backendBaseUrl() {
  const raw = process.env.BACKEND_API_URL || process.env.REACT_APP_API_URL || "";
  return raw.replace(/\/+$/, "");
}

async function fetchAccountByHandle(handle) {
  const base = backendBaseUrl();
  if (!base) return null;
  const res = await fetch(`${base}/account/handle?handle=${encodeURIComponent(handle)}`);
  if (!res.ok) return null;
  const account = await res.json();
  return account && account.userId ? account : null;
}

async function fetchRecentPosts(userId, limit) {
  const base = backendBaseUrl();
  if (!base) return [];
  const res = await fetch(`${base}/post/user?userId=${encodeURIComponent(userId)}`);
  if (!res.ok) return [];
  const posts = await res.json();
  if (!Array.isArray(posts)) return [];
  return posts
    .filter((post) => post && post.reading && post.reading.book)
    .sort((a, b) => new Date(b.registerDate || 0) - new Date(a.registerDate || 0))
    .slice(0, limit);
}

/**
 * ハンドルに紐づく公開プロフィール(アカウント情報+直近の投稿)を取得します。
 * 存在しない場合はnullを返します。emailなどPIIはAccountモデル側で@JsonIgnoreされているため含まれません。
 */
export async function fetchProfileByHandle(handle, { postLimit = 6 } = {}) {
  const account = await fetchAccountByHandle(handle);
  if (!account) return null;
  const posts = await fetchRecentPosts(account.userId, postLimit);
  return { account, posts };
}
