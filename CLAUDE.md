# ReadMyReads — 開発憲法

ReadMyReads(RMR)は個人開発の読書記録サービス。フロントエンド(`frontend/`, React)とバックエンド
(`backend/`, Spring Boot)のモノレポ構成。各ディレクトリ固有の規約は
[`backend/CLAUDE.md`](backend/CLAUDE.md) / [`frontend/CLAUDE.md`](frontend/CLAUDE.md) を参照。

このファイルはリポジトリ全体に適用される原則。**「やってよいこと」より「必ず確認すること／絶対にやらないこと」を優先して読むこと。**

## 絶対にやらないこと

- `.env` や秘密情報（`JWT_SECRET`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_BOOKS_API_KEY`, DB認証情報等）を
  コミット・ログ出力・チャット外部への送信のいずれにも含めない。
- クライアントから渡された `userId` を、状態変更系（作成・更新・削除）の処理で「本人確認済みのID」として
  使わない。バックエンドは認証トークンから解決した ID (`@AuthenticationPrincipal`) のみを信頼する
  （[backend/CLAUDE.md](backend/CLAUDE.md) の認可ルール参照）。
- `SecurityConfig` の認可ルール（`authorizeHttpRequests`）を、意図と理由をユーザーに明示して
  合意を得ないまま緩める・削除する。
- `main` ブランチへ直接コミット・force push しない。必ずブランチを切ってPR経由でマージする。
- 既存のテストを「通すため」にスキップ・削除・アサーション弱体化しない。落ちたテストは原因を直す。
- DBスキーマに影響する変更（エンティティのフィールド削除・型変更など）を、影響範囲を確認せずに行わない。
  本プロジェクトはFlyway等のマイグレーションツールを使わずJPAに委ねているため、本番相当データへの
  影響は特に慎重に扱う。

## 必ず確認すること

- 認証・認可・CORS・入力検証に関わる変更は、着手前に方針を一言で説明し、合意を得てから実装する。
- 依存ライブラリの追加・アップグレード、Spring Security / react-query のバージョン変更。
- 既存のAPIレスポンス形状やquery keyの命名を変える変更（フロント・バックエンド双方の呼び出し元に影響するため）。

## 開発フロー

- ブランチ命名: `<type>/<issue番号>-<短い説明>`（例: `fix/30-ui-polish`, `feature/23-cicd`。
  `type` は `fix` / `feature` を使い分ける。
  - なるべくissue番号に紐づけるが、issueを切らない場合はその限りではない
- 変更は必ずPR経由で `main` にマージする。PRを開く前に以下を確認:
  - backend: `cd backend && ./mvnw -B verify`
  - frontend: `cd frontend && npm test -- --watchAll=false && npm run build`
  - CI（`.github/workflows/ci.yml`）と同じコマンドなので、ローカルで通らないものはCIでも落ちる。
- 認証・認可・データアクセス範囲に関わる変更をしたPRは、マージ前に `/security-review` を実行することを
  推奨する。
- コミットメッセージは変更内容が一目で分かる命令形の要約1行（例: "Add JWT auth and fix IDOR across
  write endpoints"）。

## コメント・Javadocの書き方

- コメント・Javadocは機能の説明だけに留める。「なぜ直したか」「以前はどうだったか」といった修正の経緯・背景は書かない（コミットメッセージやPRの説明に書く）。
- コメントアウトされたコードは残さない。本当に必要な場合を除き、コメント自体も最小限にする（コードを読めば分かることは書かない）。

## このリポジトリ固有のスキル

`.claude/skills/` に、このプロジェクトの規約に沿った定型作業のスキルを用意している。該当する作業を
するときは各スキルの手順に従うこと。

- `new-endpoint` — Spring Boot側に新しいAPIエンドポイントを追加する
- `new-query-hook` — フロント側にreact-queryのAPI呼び出し・hookを追加する
- `ship-change` — Issueからブランチ作成〜検証〜PR作成までの一連の流れ

## 技術スタック（概要）

- Frontend: React 18, MUI, Tailwind/DaisyUI, @tanstack/react-query, axios, react-hook-form + zod
- Backend: Spring Boot 3 (Java 17), Spring Security, JPA/Hibernate, PostgreSQL, JJWT
- 認証: Google OAuth → 自前JWT発行（`AuthController` / `JwtService`）
- CI: GitHub Actions（`backend` / `frontend` ジョブ、詳細は `.github/workflows/ci.yml`）
- デプロイ: フロントはVercel、バックエンドはRailway(変更可能性あり)
