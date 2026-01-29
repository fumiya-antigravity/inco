# Human Setup Guide (Manual Operations)

このドキュメントは、セキュリティ上の理由からAIが自動化できない「機密情報の登録」や「管理画面での操作」の手順書です。

## 🔗 クイックリンク集
作業の進捗確認やトラブルシューティング時は以下にアクセスしてください。
※ URL内の `[ ]` 部分はご自身のユーザー名やリポジトリ名に置き換えて使用してください。

| サービス | 用途 | リンク（テンプレート） |
| :--- | :--- | :--- |
| **GitHub Actions** | 自動デプロイの成功/失敗ログ | `https://github.com/[GITHUB_USER]/[REPO_NAME]/actions` |
| **GitHub Settings** | Secrets（鍵）の登録画面 | `https://github.com/[GITHUB_USER]/[REPO_NAME]/settings/secrets/actions` |
| **Vercel** | アプリの環境変数設定 | `https://vercel.com/[VERCEL_TEAM]/[PROJECT_NAME]/settings/environment-variables` |
| **Supabase** | データベース・テーブル確認 | `https://supabase.com/dashboard/project/[SUPABASE_PROJECT_ID]/editor` |
| **Supabase Tokens** | アクセストークン発行 | [👉 Access Tokens Page](https://supabase.com/dashboard/account/tokens) |

---

## 🛠 手順 1: Vercel 環境変数の設定
VercelがSupabaseと通信するために必要です。

1. 上記リンク集の **[Vercel]** リンクから設定画面を開く。
2. 以下の変数が登録されているか確認（なければ追加）。
    * `VITE_SUPABASE_URL`: (Supabase Project URL)
    * `VITE_SUPABASE_ANON_KEY`: (Supabase Anon Public Key)
3. **重要:** 設定変更後は [Deployments] タブから **Redeploy** を行うこと。

---

## 🔐 手順 2: GitHub Secrets の設定
GitHub Actionsがデータベースを自動更新するために必要です。

1. 上記リンク集の **[GitHub Settings]** リンクからSecrets画面を開く。
2. `New repository secret` から以下の3つを登録する。

| Name | Value の入手方法 |
| :--- | :--- |
| **SUPABASE_ACCESS_TOKEN** | [Supabase Access Tokens](https://supabase.com/dashboard/account/tokens) で "Generate New Token" を作成 |
| **SUPABASE_PROJECT_ID** | SupabaseのURL `https://supabase.com/dashboard/project/xxxxx` の `xxxxx` 部分 |
| **SUPABASE_DB_PASSWORD** | プロジェクト作成時に設定したDBパスワード |

---

## ✅ 動作確認フロー

1. **GitHubへのプッシュ**
   AIエージェント等でコードを修正し、GitHubの `main` ブランチへプッシュする。

2. **データベース反映の確認 (GitHub Actions)**
   以下のURLにアクセスし、最新のワークフローが「緑色のチェック ✅」になっていることを確認する。
   * 👉 `https://github.com/[GITHUB_USER]/[REPO_NAME]/actions`

3. **アプリ反映の確認 (Vercel)**
   以下のURLにアクセスし、最新のデプロイStatusが「Ready」になっていることを確認する。
   * 👉 `https://vercel.com/[VERCEL_TEAM]/[PROJECT_NAME]/deployments`

4. **実動作の確認**
   以下の本番URLにアクセスして、実際の画面を確認する。
   * 👉 `https://[PROJECT_NAME].vercel.app`
