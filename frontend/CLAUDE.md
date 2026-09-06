# frontend/CLAUDE.md — Reactフロントエンドの規約

全体方針は [ルートCLAUDE.md](../CLAUDE.md) を先に読むこと。ここではfrontend固有の設計・規約を扱う。

## アーキテクチャ（データ取得の層）

`src/` 配下、データ取得は3層に分かれている。新しいAPI呼び出しを追加するときは必ずこの順で作る
（詳細な手順は `.claude/skills/new-query-hook` 参照）:

1. `src/api/*.js` — axios呼び出しの実体（`http.js` の共通インスタンスを使う）。リソース単位で
   ファイルが分かれる（`book.js`, `reading.js`, `post.js` など）。
2. `src/api/queryKeys.js` — **react-queryのqueryKeyを一元管理する唯一の場所。**
3. `src/hooks/use*.js` — `useQuery`/`useMutation`をラップしたカスタムフック。コンポーネントは
   これを呼ぶ。

`src/components/`, `src/ui/` はプレゼンテーション層。

## 守るべきルール（react-queryキャッシュ）

- **queryKeyの文字列/配列をhooks内やコンポーネント内に直書きしない。** 必ず `queryKeys.js` に
  エントリを追加し、`useQuery`側と`invalidateQueries`/`setQueryData`側の両方がそこ経由でキーを
  組み立てる。ここがずれるとキャッシュミスによる不要な再フェッチや、逆にキャッシュが更新されずに
  古いデータが表示される不具合が起きる（実際にモーダル再オープン時の不要な再フェッチをこの一元化で
  修正した経緯がある）。
- 何らかの `useMutation` 相当の処理（`register`/`update`/`delete`系の関数）を追加したら、影響する
  queryKeyを洗い出し、`queryClient.invalidateQueries` を対応する箇所で呼ぶ。既存の `useReading.js` の
  `registerReading` 実装がパターンの参考になる。

## 認証

- トークンは `localStorage` の `token` キーに保存し、`src/api/http.js` の axios interceptorが
  自動で `Authorization: Bearer <token>` を付与する。新しいAPI呼び出しを追加するときは、独自の
  axiosインスタンスを作らずこの `http` を使う。
- 401応答時は同interceptorが `token`/`user` をクリアする。認証エラー時の独自ハンドリングを
  各hookに散らさない。

## テスト・検証

- コマンド（CIと同一）:
  - テスト: `npm test -- --watchAll=false`
  - ビルド: `npm run build`
  - 開発起動: `npm start`
- Node バージョンは `.nvmrc` に従う。

## スタイリング

MUI（`@mui/material`, `@mui/joy`）とTailwind/DaisyUIが併用されている。既存コンポーネントが
どちらを使っているかを確認し、混在させる場合は近接コンポーネントの慣習に合わせる。
