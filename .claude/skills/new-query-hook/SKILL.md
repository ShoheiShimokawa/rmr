---
name: new-query-hook
description: フロントエンド(frontend/)で新しいAPI呼び出しとreact-queryフックを、api→queryKeys→hooksの3層構造とキャッシュ無効化の規約に沿って追加する。「フックを追加して」「このAPIを呼ぶ画面を作って」のような依頼で使う。
---

# 新規react-query呼び出し・フック追加

frontendで新しいデータ取得/更新を追加するときの標準手順。前提として
[frontend/CLAUDE.md](../../../frontend/CLAUDE.md) のキャッシュ規約を必ず読むこと。

## 手順

1. **既存の近い実装を1つ探して読む。** `src/api/reading.js` + `src/hooks/useReading.js` の組が
   参照系・更新系（登録・更新・削除）を一通り含んでいて最も参考になる。

2. **`src/api/<resource>.js` にaxios呼び出しを足す（または既存ファイルに追加する）。**
   `src/api/http.js` の共通`http`インスタンスを使う。新しいaxiosインスタンスを作らない
   （認証ヘッダの自動付与・401時のトークンクリアが効かなくなるため）。

3. **`src/api/queryKeys.js` にこのデータのキーを追加する。**
   既存のキー（例: `readingsByBook: (bookId) => ["readingsByBook", bookId]`）と同じ命名パターン
   （`camelCase` + 依存する識別子を引数に取る関数）に合わせる。**このファイルを経由しない
   queryKeyの直書きは禁止。**

4. **`src/hooks/use<Resource>.js` にフックを書く。**
   - 取得系: `useQuery({ queryKey: queryKeys.xxx(id), queryFn: ..., enabled: !!id })` の形。
   - 更新系（register/update/delete相当）: `useCallback` で関数を作り、成功後に関係する
     `queryKeys` のエントリすべてに対して `queryClient.invalidateQueries({ queryKey: ... })` を
     呼ぶ。「このデータが変わったら、画面上のどこが古くなるか」を洗い出してから invalidate 対象を
     決める（`useReading.js` の `registerReading` が参考実装）。

5. **コンポーネント側はこのフックだけを呼ぶ。** `src/api/*.js` を直接importしない。

6. **確認:** `npm test -- --watchAll=false` を実行する。UIで実際に「更新→一覧が古いまま/二重
   フェッチされないか」を目視できるなら確認する。

## やってはいけないこと

- `queryKeys.js` を経由しない配列リテラルのqueryKeyをどこかに書くこと。
- 更新系フックを追加したのに、影響する画面のqueryKeyをinvalidateし忘れること（古いデータが
  残る/逆に不要な再フェッチが起きる、いずれも過去に修正した不具合パターン）。
- `http.js` を経由しない独自のaxiosインスタンスを作ること。
