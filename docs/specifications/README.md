# INCO 仕様書インデックス

## 概要

このディレクトリには、INCO プロジェクト管理システムの各機能の詳細仕様書が含まれています。

## 仕様書一覧

### 📋 共通仕様
- **[COMMON_SPEC.md](./COMMON_SPEC.md)** - 共通データモデル、UI/UXパターン、カスタムフック
  - データモデル (Projects, Tasks, Sections)
  - バリデーション & 制約ルール
  - タスク項目と初期値
  - 共通UI/UXパターン
  - カスタムフック (useTaskCreation, useTaskSorting)
  - データ変換 (TaskMapper)
  - スタイルガイド

### 📊 ビュー仕様

#### [LIST_SPEC.md](./LIST_SPEC.md) - リストビュー
- テーブル構造とカラム構成
- ソート機能 (セカンダリソート含む)
- セクション機能
- インライン編集
- タスク作成
- ドラッグ&ドロップ
- Asana風デザイン (境界線)

#### [BOARD_SPEC.md](./BOARD_SPEC.md) - ボードビュー
- カンバン形式のレイアウト
- ステータスベースのカラム
- タスクカード
- ドラッグ&ドロップ
- (将来実装予定)

#### [TIMELINE_SPEC.md](./TIMELINE_SPEC.md) - タイムラインビュー
- ガントチャート形式
- タスクバー表示
- 期間編集
- 依存関係
- (将来実装予定)

#### [CALENDAR_SPEC.md](./CALENDAR_SPEC.md) - カレンダービュー
- 月/週/日表示
- 期限日ベースの表示
- ドラッグ&ドロップ
- (将来実装予定)

#### [WIKI_SPEC.md](./WIKI_SPEC.md) - Wiki
- Markdownエディタ
- リアルタイムプレビュー
- ページ管理 (ツリー構造)
- 全文検索
- (将来実装予定)

### 🎨 レイアウト仕様

#### [HEADER_SPEC.md](./HEADER_SPEC.md) - ヘッダー
- プロジェクト情報表示
- ビュー切り替えタブ
- 検索ボタン
- ユーザーメニュー
- レスポンシブ対応

#### [SIDEBAR_SPEC.md](./SIDEBAR_SPEC.md) - サイドバー
- プロジェクト一覧
- ナビゲーション
- 折りたたみ機能
- ダークモード切り替え
- レスポンシブ対応

---

## ファイル構成とコード対応

### コンポーネント構造

```
app/src/
├── components/
│   ├── features/
│   │   ├── board/
│   │   │   └── BoardView.jsx          → BOARD_SPEC.md
│   │   ├── list/
│   │   │   └── ListView.jsx           → LIST_SPEC.md
│   │   ├── wiki/
│   │   │   └── WikiView.jsx           → WIKI_SPEC.md
│   │   └── task/
│   │       └── SharedComponents.jsx   → COMMON_SPEC.md
│   └── layout/
│       ├── Header.jsx                  → HEADER_SPEC.md
│       ├── Sidebar.jsx                 → SIDEBAR_SPEC.md
│       └── MainLayout.jsx
├── context/
│   └── AppContext.tsx                  → COMMON_SPEC.md
├── hooks/
│   ├── useTaskCreation.ts              → COMMON_SPEC.md
│   └── useTaskSorting.ts               → COMMON_SPEC.md
├── types/
│   ├── task.ts                         → COMMON_SPEC.md
│   └── project.ts                      → COMMON_SPEC.md
├── utils/
│   └── taskMapper.ts                   → COMMON_SPEC.md
└── constants/
    └── taskDefaults.ts                 → COMMON_SPEC.md
```

---

## 仕様書の使い方

### 新機能開発時

1. **該当する仕様書を確認**
   - 例: リストビューの機能追加 → `LIST_SPEC.md`

2. **関連ファイルを確認**
   - 仕様書内の「関連ファイル」セクションを参照
   - コードファイルへのリンクをクリック

3. **共通仕様を確認**
   - `COMMON_SPEC.md` で共通パターンを確認
   - カスタムフックやユーティリティの使用方法を確認

### バグ修正時

1. **該当機能の仕様書を確認**
   - 期待される動作を確認

2. **実装ファイルを確認**
   - 仕様書からコードファイルへ移動

3. **関連仕様を確認**
   - 他の機能への影響を確認

### コードレビュー時

1. **変更内容と仕様書を照合**
   - 仕様に沿った実装か確認

2. **共通パターンの使用を確認**
   - カスタムフックの使用
   - スタイルガイドの遵守

---

## 仕様書の更新

### 更新タイミング

- 新機能追加時
- 既存機能の変更時
- バグ修正で仕様が変わる場合

### 更新手順

1. 該当する仕様書を開く
2. 変更内容を記述
3. 関連ファイルのリンクを更新
4. コード例を更新

---

## 関連ドキュメント

### 開発ガイド
- [`/docs/DEVELOPMENT_RULES.md`](../DEVELOPMENT_RULES.md) - 開発ルール
- [`/docs/SPECIFICATIONS.md`](../SPECIFICATIONS.md) - 全体仕様

### アーキテクチャ
- [`/app/README.md`](../../app/README.md) - アプリケーション構成

---

## 更新履歴

### 2026-01-30
- 初版作成
- 7つの仕様書を作成 (COMMON, LIST, BOARD, WIKI, TIMELINE, CALENDAR, HEADER, SIDEBAR)
- 各仕様書にコードファイルへのリンクを追加
