---
name: new-endpoint
description: Spring Bootバックエンド(backend/)に新しいAPIエンドポイントを、このプロジェクトの層構造と認可規約(IDOR対策込み)に沿って追加する。「エンドポイント追加して」「APIを作って」のような依頼で使う。
---

# 新規APIエンドポイント追加

backendに新しいAPIエンドポイントを追加するときの標準手順。前提として
[backend/CLAUDE.md](../../../backend/CLAUDE.md) の認可ルールを必ず読むこと。

## 手順

1. **既存の近いエンドポイントを1つ探して読む。**
   `ReadingController`/`ReadingService`か`PostController`/`PostService`が最も参考になる
   （参照系・更新系の両方が揃っている）。新規実装はそのファイルのスタイル（命名・パッケージ配置・
   Lombokの使い方）に合わせる。

2. **このエンドポイントは「参照系(公開可)」か「状態変更系(認証必須)」かを最初に決める。**
   - 参照系（一覧取得・詳細取得など、副作用なし）→ `@RequestParam` でIDを受け取ってよい。
     `SecurityConfig` の `GET /api/**` は原則 permitAll なので追加設定は基本不要。
   - 状態変更系（作成・更新・削除・フォロー等の副作用あり）→ 必ず認証必須にする。
     `SecurityConfig` の既存ルール（`GET /api/notification` は認証必須、その他の非GETは
     `authorizeHttpRequests` の最後の `.requestMatchers("/api/**").authenticated()` に
     自然に該当する）を確認し、新しいパスパターンが必要な例外を作らないなら追加設定は不要。
     例外的なルールを足す場合は、必ずユーザーに理由を説明し確認を取ってから`SecurityConfig`を
     変更する。

3. **DTOはmodelのネストクラスとして定義する。** 独立した`dto`パッケージは作らない。
   例: `Reading.RegisterReading` のように、対応するエンティティクラス内に
   `public static record XxxYyy(...)` を追加する。

4. **Repository → Service → Controllerの順に実装する。**
   - `context/XxxRepository` に必要なクエリメソッドを足す（Spring Data JPAの命名規約に従う、
     複雑なら`@Query`）。
   - `service/XxxService` にビジネスロジックを書く。不正な入力・状態は `BadRequestException` を
     投げる。
   - `controller/XxxController` はservice呼び出しに徹する。状態変更系メソッドの引数には
     **必ず** `@AuthenticationPrincipal Integer currentUserId` を含め、リクエストボディの
     `userId` ではなくこの値を使って所有者チェック・書き込みを行う。

5. **確認:**
   - `./mvnw -B verify` を実行し、既存テストを壊していないか確認する。
   - 認可周りを触った場合は特に、意図しないエンドポイントを公開/非公開にしていないか
     `SecurityConfig` の差分を見直す。
   - 可能であればservice層のユニットテストを追加する（`src/test/java/com/rmr/backend/` 配下、
     既存の `JwtServiceTest` がテンプレートになる）。

## やってはいけないこと

- リクエストボディ/クエリパラメータの `userId` をそのまま「操作対象の本人」として使うこと
  （IDOR）。必ず `@AuthenticationPrincipal` から取得したIDを使う。
- `SecurityConfig` のルールを、確認なしに緩める・並び替えて意図せぬエンドポイントを公開すること。
