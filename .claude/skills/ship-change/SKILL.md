---
name: ship-change
description: このプロジェクトのブランチ命名・検証コマンド・PR作成の型に沿って、GitHub Issueを1件出荷する（ブランチ作成〜実装〜検証〜PR作成）。「Issue #Nに対応して」「この修正をPRにして」のような依頼で使う。
---

# 変更の出荷（Issue → ブランチ → 検証 → PR）

このプロジェクトの実際の運用（`git log`, `.github/workflows/ci.yml`）から抽出した型。
前提として[ルートCLAUDE.md](../../../CLAUDE.md)の「開発フロー」節を必ず読むこと。

## 手順

1. **ブランチを作る。** 命名規約: `<type>/<issue番号>-<短い英語スラグ>`
   - `type` は次のいずれか: `fix`（バグ修正、リファクタ、UI微調整など含む）, `feature`（新機能・追加）
   - 例: `fix/30-loading`, `feature/23-cicd`
   - `main` から分岐する。作業前に `git status` で作業ツリーがクリーンなことを確認する。

2. **実装する。** 該当する場合は `new-endpoint` / `new-query-hook` スキルの手順に従う。
   認証・認可・CORS・入力検証に関わる変更は、着手前にユーザーに一言確認する
   （ルートCLAUDE.mdの「必ず確認すること」）。

3. **コミットする。** メッセージは変更内容が一目で分かる命令形の要約1行。
   （例: "Add JWT auth and fix IDOR across write endpoints"）

4. **マージ前に必ずローカルで検証する（CIと同一コマンド）:**
   - backend: `cd backend && ./mvnw -B verify`
   - frontend: `cd frontend && npm test -- --watchAll=false && npm run build`
     どちらか一方しか触っていなくても、影響範囲が疑わしければ両方実行する。

5. **認証・認可・データアクセス範囲に関わる変更をした場合は `/security-review` を実行する。**
   一般的な品質観点（重複・簡潔さ・効率）は `/code-review` で確認してもよい。

6. **PRを作成する。** `main` 向け。タイトルは変更内容の要約でよい。本文にIssue番号への参照
   （`Closes #N` 等）を含める。

## やってはいけないこと

- `main` に直接コミット・force push すること。
- ローカルで検証コマンドを通さずにPRを開くこと（CIで落ちる想定のものを出さない）。
- 認証・認可に関わる変更を、ユーザーへの確認なしにマージすること。
