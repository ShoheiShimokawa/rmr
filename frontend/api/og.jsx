import { ImageResponse } from "@vercel/og";
import { fetchProfileByHandle, isReservedHandle } from "./_lib/profile.js";

export const config = { runtime: "edge" };

const WIDTH = 1200;
const HEIGHT = 630;
const BIO_MAX_LENGTH = 90;

// アプリ本体の背景色(App.jsのメインコンテンツ背景)に合わせる
const BACKGROUND_COLOR = "#F5F5F5";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#5f6368";
const ACCENT_COLOR = "#784af4";

function initial(name) {
  return (name || "?").trim().charAt(0).toUpperCase() || "?";
}

/** ハンドル・直近の本の表紙付きで、ユーザーごとのOGP画像を動的に生成します。 */
export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const handle = searchParams.get("handle") || "";

  if (isReservedHandle(handle)) {
    return new Response("Not found", { status: 404 });
  }

  const profile = await fetchProfileByHandle(handle, { postLimit: 4 });
  if (!profile) {
    return new Response("Not found", { status: 404 });
  }

  const { account, posts } = profile;
  const displayName = account.name || account.handle;
  const bio = (account.description || "").trim();
  const shortBio =
    bio.length > BIO_MAX_LENGTH ? `${bio.slice(0, BIO_MAX_LENGTH)}…` : bio;
  const covers = posts
    .map((post) => post.reading?.book?.thumbnail)
    .filter(Boolean)
    .slice(0, 4);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background: BACKGROUND_COLOR,
          fontFamily: "sans-serif",
          color: TEXT_PRIMARY,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {account.picture ? (
            <img
              src={account.picture}
              width={104}
              height={104}
              style={{
                borderRadius: "50%",
                border: `4px solid ${ACCENT_COLOR}`,
              }}
            />
          ) : (
            <div
              style={{
                width: 104,
                height: 104,
                borderRadius: "50%",
                background: "rgba(120,74,244,0.12)",
                color: ACCENT_COLOR,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 48,
                fontWeight: 700,
              }}
            >
              {initial(displayName)}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 44, fontWeight: 700 }}>{displayName}</div>
            <div
              style={{ display: "flex", fontSize: 26, color: TEXT_SECONDARY }}
            >
              @{account.handle}
            </div>
          </div>
        </div>

        {shortBio ? (
          <div
            style={{
              display: "flex",
              fontSize: 28,
              lineHeight: 1.5,
              color: TEXT_SECONDARY,
            }}
          >
            {shortBio}
          </div>
        ) : (
          <div style={{ display: "flex" }} />
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {covers.length > 0 && (
            <div style={{ display: "flex", gap: 16 }}>
              {covers.map((src) => (
                <img
                  key={src}
                  src={src}
                  width={96}
                  height={140}
                  style={{
                    borderRadius: 6,
                    objectFit: "cover",
                    boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
                  }}
                />
              ))}
            </div>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: 24,
              fontWeight: 700,
              color: ACCENT_COLOR,
            }}
          >
            📚 #readmyreads
          </div>
        </div>
      </div>
    ),
    { width: WIDTH, height: HEIGHT }
  );
}
