import { fetchProfileByHandle, isReservedHandle } from "./_lib/profile.js";
import { escapeHtml, truncate } from "./_lib/escape.js";

export const config = { runtime: "edge" };

const SITE_NAME = "ReadMyReads";
const HASHTAG = "#ReadMyReads";

function resolveOrigin(req) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto =
    req.headers.get("x-forwarded-proto") ||
    (host && host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

function htmlResponse(body, { status = 200, cacheable = false } = {}) {
  return new Response(body, {
    status,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": cacheable
        ? "public, s-maxage=3600, stale-while-revalidate=86400"
        : "public, s-maxage=60, stale-while-revalidate=300",
    },
  });
}

function renderNotFound(origin) {
  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<meta name="robots" content="noindex" />
<title>ユーザーが見つかりません | ${SITE_NAME}</title>
</head>
<body>
<h1>ユーザーが見つかりません</h1>
<p><a href="${origin}/">${SITE_NAME}</a> に戻る</p>
</body>
</html>`;
}

function renderProfile({ origin, account, posts }) {
  const displayName = account.name || account.handle;
  const bio = truncate(
    account.description || `${displayName}さんの読書記録`,
    140
  );
  // SNSでシェアされたときの説明文(og:description/twitter:description)にのみ
  // 公式ハッシュタグを付与する。検索エンジン向けのdescription/構造化データには含めない。
  const shareBio = `${truncate(bio, 140 - HASHTAG.length - 1)} ${HASHTAG}`;
  const title = `${displayName}(@${account.handle})の本棚 | ${SITE_NAME}`;
  const url = `${origin}/${encodeURIComponent(account.handle)}`;
  const ogImage = `${origin}/api/og?handle=${encodeURIComponent(account.handle)}`;

  const books = posts.map((post) => post.reading.book).filter(Boolean);
  const bookListHtml = books
    .map(
      (book) =>
        `<li>${escapeHtml(book.title)}${
          book.author ? ` / ${escapeHtml(book.author)}` : ""
        }</li>`
    )
    .join("");

  // JSON.stringify は "<" 等をエスケープしないため、そのまま<script>タグに埋め込むと
  // ユーザー入力(name/description)次第でタグが閉じられHTMLとして解釈されてしまう(XSS)。
  // "<" を < に置き換えて無害化する。
  const structuredData = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: title,
    url,
    mainEntity: {
      "@type": "Person",
      name: displayName,
      alternateName: account.handle,
      description: bio,
      ...(account.picture ? { image: account.picture } : {}),
    },
  }).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(bio)}" />
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${url}" />
<meta property="og:type" content="profile" />
<meta property="og:site_name" content="${SITE_NAME}" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(shareBio)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(shareBio)}" />
<meta name="twitter:image" content="${ogImage}" />
<script type="application/ld+json">${structuredData}</script>
</head>
<body>
<h1>${escapeHtml(displayName)} (@${escapeHtml(account.handle)})</h1>
<p>${escapeHtml(bio)}</p>
${books.length ? `<h2>最近読んだ本</h2><ul>${bookListHtml}</ul>` : ""}
<p><a href="${url}">${SITE_NAME}で本棚を見る</a></p>
</body>
</html>`;
}

/** クローラー向けに `/:handle` の内容をサーバ側で描画して返す(通常ユーザーはSPAのまま)。 */
export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get("handle") || "";
  const origin = resolveOrigin(req);

  if (isReservedHandle(handle)) {
    return htmlResponse(renderNotFound(origin), { status: 404 });
  }

  const profile = await fetchProfileByHandle(handle);
  if (!profile) {
    return htmlResponse(renderNotFound(origin), { status: 404 });
  }

  return htmlResponse(
    renderProfile({ origin, account: profile.account, posts: profile.posts }),
    { cacheable: true }
  );
}
