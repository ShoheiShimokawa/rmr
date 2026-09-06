# backend/CLAUDE.md — Spring Bootバックエンドの規約

全体方針は [ルートCLAUDE.md](../CLAUDE.md) を先に読むこと。ここではbackend固有の設計・規約を扱う。

## アーキテクチャ

`src/main/java/com/rmr/backend/` 配下:

- `controller/` — `@RestController`。リクエスト受け口。ビジネスロジックを書かず`service`に委譲する。
- `service/` — ビジネスロジック。
- `context/` — `*Repository`（Spring Data JPA）。
- `model/` — JPAエンティティ。**DTOは別パッケージに切らず、関連エンティティのネストした
  `record`/静的クラスとして定義する**（例: `Reading.RegisterReading`, `Reading.UpdateReading`,
  `Book.RegisterBook`）。新しいエンドポイント用のリクエスト/レスポンス型もこの慣習に従うこと。
- `security/` — `JwtAuthFilter`（Authorizationヘッダを検証しSecurityContextへ`principal=userId`を
  セット）, `JwtService`。
- `type/` — enum群。
- `util/` — `BadRequestException` + `GlobalExceptionHandler`（`@RestControllerAdvice`）。
  業務エラーはこの例外を投げれば統一フォーマットのJSONで返る。

## 認可ルール（最重要・ここは特に慎重に）

`SecurityConfig` の現在の方針:

- `POST /api/auth/google`, `POST /api/account/register` — 未認証で許可（ログイン導線のため）。
- `GET /api/notification` — 認証必須（本人専用データ）。
- その他の `GET /api/**`（プロフィール・投稿・読書記録などの参照系） — 現状は公開（未認証で閲覧可）。
  これは意図的な設計。変更する場合はルートCLAUDE.mdの「必ず確認すること」に従いユーザーに確認する。
- 上記以外の `/api/**`（作成・更新・削除などの状態変更系） — 認証必須。

**コントローラを書くときのルール:**

- 状態を変更するエンドポイント（POST/PUT/DELETE相当）で「誰の操作か」を必要とする場合は、必ず
  `@AuthenticationPrincipal Integer currentUserId` で取得し、それを使う。リクエストボディや
  クエリパラメータで渡された `userId` を書き込み対象の本人IDとして信用しない
  参考実装: `ReadingController.register/update/delete`, `PostController.good/delete`,
  `NotificationController`, `AccountController.follow/updateProfile/delete`）。
- 参照系（GETで公開している一覧・詳細取得）はこれまで通り `@RequestParam` の `userId`/`bookId` 等で
  絞り込んでよい。ここは非公開データの参照でない限り、既存パターンを踏襲する。
- ビジネスエラー（不正な入力・状態遷移など）は `BadRequestException` を投げる。新しいエラー種別が
  必要なら同様に例外クラスを増やし`GlobalExceptionHandler`にハンドラを足す。

## テスト・検証

- 現状テストは薄い（`RrdsApplicationTests`, `security/JwtServiceTest` のみ）。新規のservice/security
  ロジックを書いたら、可能な範囲でユニットテストを追加する。少なくとも `./mvnw -B verify` を通すことは必須。
- コマンド:
  - 全体検証（CIと同一）: `./mvnw -B verify`
  - テストのみ: `./mvnw test`
  - 単一テストクラス: `./mvnw test -Dtest=JwtServiceTest`
- ローカル実行にはCIの `env:` セクション（`backend/../.github/workflows/ci.yml`）と同等の環境変数
  （`.env`、READMEの手順）が必要。PostgreSQLが前提。

## その他

- Lombok（`@RequiredArgsConstructor`, `@AllArgsConstructor`）を使ってボイラープレートを減らす慣習。
- マイグレーションツール未導入（Flyway/Liquibaseなし）。エンティティ変更はHibernateのDDL自動生成に
  委ねているため、破壊的な変更（カラム削除・型変更）は既存データへの影響をルートCLAUDE.mdの通り
  必ず確認する。
