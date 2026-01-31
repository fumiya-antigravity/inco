# 問題パターンデータベース

このドキュメントは、過去に発生したバグのパターンを記録し、将来の調査に役立てるためのものです。

---

## パターン1: データベーススキーマとUIの不整合

### 症状
- UIで選択した値がDBに保存されない
- ページをリロードすると選択した値が消える
- 状態管理(Context)では正しく更新されているが、永続化されない

### 原因
- データベーススキーマ(例: `assignee_id UUID`)とUI(例: `assignees: string[]`)でデータ型が異なる
- `updateTask`関数で特定のフィールドが早期リターンしてDBに保存されない
- 型定義ファイル(TaskDB)にフィールドが定義されていない

### 調査方法

1. **型定義ファイルを確認**
   ```bash
   view_file app/src/types/task.ts
   grep -rn "interface.*TaskDB" app/src/types
   ```

2. **データベーススキーマを確認**
   ```bash
   view_file supabase/migrations/*.sql
   grep -rn "CREATE TABLE.*tasks" supabase/migrations
   ```

3. **updateTask関数を確認**
   ```bash
   view_code_item app/src/context/AppContext.tsx updateTask
   grep -rn "updateTask" app/src/context
   ```

4. **早期リターンを検索**
   ```bash
   grep -rn "return;" app/src/context/AppContext.tsx
   ```

### 解決策

1. **型定義を統一する**
   - TaskDB型にフィールドを追加
   - DBスキーマとTaskDB型を一致させる

2. **updateTask関数を修正する**
   - 早期リターンを削除
   - フィールドを適切にマッピング(例: `assignees` → `assignee_id`)

3. **データのマッピングを実装する**
   - DBから取得時: `assignee_id` → `assignees: [assignee_id]`
   - DB保存時: `assignees: [name]` → `assignee_id: name`

### 関連問題
- 担当者セレクターバグ (2026-01-30)

### 頻度
- 中 (新しいフィールド追加時に発生しやすい)

### 予防策
- Phase 0で型定義ファイルを必ず確認する
- DBマイグレーション作成時に型定義も更新する
- Lintエラーを無視しない

---

## パターン2: イベント伝播の問題

### 症状
- クリックイベントが親要素に伝播しない
- 期待される動作が発生しない
- 特定の要素をクリックしても何も起こらない

### 原因
- stopPropagation()の多重使用
- イベントハンドラーの階層構造の理解不足
- readOnlyプロップなどの制御機構がない

### 調査方法

1. **stopPropagationの使用箇所を検索**
   ```bash
   grep -rn "stopPropagation" app/src --include="*.jsx" --include="*.tsx"
   ```

2. **イベントハンドラーの階層を確認**
   ```bash
   view_code_item app/src/components/features/list/ListView.jsx
   ```

3. **各階層でのstopPropagation呼び出しを確認**

### 解決策
- 必要最小限の箇所でのみstopPropagationを使用
- readOnlyプロップなどで動作を制御
- コンポーネント内部で責任を持って制御

### 関連問題
- ListView クリック動作 (2026-01-30)

### 頻度
- 高 (イベントハンドラーを追加するたびに発生しやすい)

### 予防策
- stopPropagationを使う前に、本当に必要か検討する
- readOnlyプロップなどの制御機構を最初から設計する

---

## パターン3: ブラウザキャッシュの問題

### 症状
- コードを修正したのに変更が反映されない
- git diffでは修正されているが、ブラウザで確認すると古いコードが動作している

### 原因
- ブラウザがJavaScriptファイルをキャッシュしている
- ハードリフレッシュを実行していない

### 調査方法

1. **ハードリフレッシュを実行**
   - Mac: `Cmd + Shift + R`
   - Windows: `Ctrl + Shift + R`

2. **キャッシュをクリア**
   - ブラウザの設定からキャッシュをクリア

### 解決策
- 常にハードリフレッシュを実行する
- 開発サーバーを再起動する

### 関連問題
- (該当なし)

### 頻度
- 高 (開発中は頻繁に発生)

### 予防策
- Phase 0でハードリフレッシュを実行する
- 開発サーバーの設定でキャッシュを無効化する

---

## テンプレート

### 症状
- 

### 原因
- 

### 調査方法
1. 

### 解決策
- 

### 関連問題
- 

### 頻度
- 低/中/高

### 予防策
- 
