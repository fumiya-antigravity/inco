# ナレッジベースと自動化ツール

このディレクトリには、バグ調査と開発効率化のためのナレッジベースと自動化ツールが含まれています。

## ディレクトリ構造

```
docs/
├── BUG_INVESTIGATION_METHODOLOGY.md  # バグ調査メソドロジー
├── templates/                         # 仕様書テンプレート
│   ├── component_spec_template.md    # コンポーネント仕様書テンプレート
│   └── feature_spec_template.md      # 機能仕様書テンプレート
└── knowledge/                         # ナレッジベース
    ├── problem_patterns.md           # 問題パターンデータベース
    └── investigation_commands.md     # 調査コマンドライブラリ

scripts/
├── find-related-files.sh             # 関連ファイル検索スクリプト
└── detect-issues.sh                  # 問題検出スクリプト
```

## 使い方

### 1. バグ調査メソドロジー

**ファイル**: [`docs/BUG_INVESTIGATION_METHODOLOGY.md`](./BUG_INVESTIGATION_METHODOLOGY.md)

最高峰のエンジニアとしてのバグ調査手法を体系化したドキュメント。

**主な内容**:
- 基本原則と自律的チェック思考
- 関連ファイル特定の6つのアプローチ
- 仕様書との紐付けとナレッジ蓄積
- メンテナンス性・保守性を考慮した実装
- 調査コスト削減のための仕組み

**使用タイミング**: バグ調査開始時、調査が行き詰まった時

### 2. 仕様書テンプレート

#### コンポーネント仕様書

**ファイル**: [`docs/templates/component_spec_template.md`](./templates/component_spec_template.md)

新しいコンポーネントを作成する際、または既存のコンポーネントを文書化する際に使用。

**使用方法**:
```bash
cp docs/templates/component_spec_template.md docs/specifications/components/AssigneeSelector.md
# ファイルを編集して仕様を記述
```

#### 機能仕様書

**ファイル**: [`docs/templates/feature_spec_template.md`](./templates/feature_spec_template.md)

新しい機能を実装する際、または既存の機能を文書化する際に使用。

**使用方法**:
```bash
cp docs/templates/feature_spec_template.md docs/specifications/features/TaskListClick.md
# ファイルを編集して仕様を記述
```

### 3. ナレッジベース

#### 問題パターンデータベース

**ファイル**: [`docs/knowledge/problem_patterns.md`](./knowledge/problem_patterns.md)

過去に発生した問題のパターンを記録。

**使用方法**:
1. バグ調査時に類似の問題がないか確認
2. 問題解決後に新しいパターンを追加

**現在のパターン**:
- パターン1: イベント伝播の問題 (stopPropagation)
- パターン2: CSSクラスの残存 (dark:クラス)
- パターン3: ブラウザキャッシュの問題

#### 調査コマンドライブラリ

**ファイル**: [`docs/knowledge/investigation_commands.md`](./knowledge/investigation_commands.md)

バグ調査で頻繁に使用するコマンドをカテゴリ別に整理。

**カテゴリ**:
1. Git関連
2. イベントハンドラー
3. コンポーネント・関数の使用箇所
4. プロップの追跡
5. CSSクラス
6. ファイル構造
7. テスト
8. ドキュメント
9. ビルド・サーバー
10. 一括操作

### 4. 自動化スクリプト

#### 関連ファイル検索スクリプト

**ファイル**: [`scripts/find-related-files.sh`](../scripts/find-related-files.sh)

特定のコンポーネントに関連するファイルを6つのアプローチで検索。

**使用方法**:
```bash
./scripts/find-related-files.sh ListView
./scripts/find-related-files.sh AssigneeSelector
```

**出力例**:
```
=========================================
関連ファイル検索: ListView
=========================================

## アプローチ1: import/export
---
app/src/pages/ProjectView.jsx:10:import ListView from '../components/features/list/ListView';

## アプローチ2: 使用箇所
---
app/src/components/features/list/ListView.jsx:1:import React from 'react';
...
```

#### 問題検出スクリプト

**ファイル**: [`scripts/detect-issues.sh`](../scripts/detect-issues.sh)

コードベース内の潜在的な問題を自動検出。

**使用方法**:
```bash
./scripts/detect-issues.sh
```

**検出項目**:
1. stopPropagationの使用箇所
2. dark:クラスの残存
3. console.logの残存
4. TODOコメント
5. FIXMEコメント

**出力例**:
```
=========================================
問題検出スクリプト
=========================================

## 1. stopPropagationの使用箇所
---
検出数: 8 箇所

## 2. dark:クラスの残存
---
検出数: 0 箇所

...

## サマリー
---
stopPropagation: 8 箇所
dark:クラス: 0 箇所
console.log: 3 箇所
TODO: 5 箇所
FIXME: 0 箇所

合計: 16 箇所の潜在的な問題を検出
```

## ワークフロー例

### バグ調査のワークフロー

1. **事前準備**
   ```bash
   # 問題検出スクリプトを実行
   ./scripts/detect-issues.sh
   
   # 関連ファイルを検索
   ./scripts/find-related-files.sh <ComponentName>
   ```

2. **調査**
   - [`BUG_INVESTIGATION_METHODOLOGY.md`](./BUG_INVESTIGATION_METHODOLOGY.md)を参照
   - [`investigation_commands.md`](./knowledge/investigation_commands.md)からコマンドを実行
   - [`problem_patterns.md`](./knowledge/problem_patterns.md)で類似の問題を確認

3. **解決**
   - 問題を修正
   - テストを実行
   - 動作確認

4. **ナレッジ蓄積**
   - [`problem_patterns.md`](./knowledge/problem_patterns.md)に新しいパターンを追加
   - コンポーネント仕様書に「過去の問題」セクションを追加

### 新機能開発のワークフロー

1. **仕様書作成**
   ```bash
   # 機能仕様書を作成
   cp docs/templates/feature_spec_template.md docs/specifications/features/NewFeature.md
   
   # コンポーネント仕様書を作成
   cp docs/templates/component_spec_template.md docs/specifications/components/NewComponent.md
   ```

2. **実装**
   - 仕様書に従って実装
   - テストを作成

3. **レビュー**
   - 問題検出スクリプトを実行
   - コードレビュー

4. **文書化**
   - 仕様書を更新
   - ナレッジベースに知見を追加

## 定期的なメンテナンス

### 週次レビュー

- [ ] 新しい問題パターンを追加
- [ ] 仕様書を更新
- [ ] ナレッジベースを更新
- [ ] 調査コマンドライブラリを更新

### 月次レビュー

- [ ] 問題パターンの発生頻度を分析
- [ ] 調査コストの推移を確認
- [ ] 自動化ツールを改善
- [ ] チーム内で知見を共有

## 貢献

新しい問題パターン、調査コマンド、自動化スクリプトを見つけた場合は、積極的に追加してください。

### 問題パターンの追加

1. [`docs/knowledge/problem_patterns.md`](./knowledge/problem_patterns.md)を開く
2. テンプレートに従って新しいパターンを追加
3. 統計情報を更新

### 調査コマンドの追加

1. [`docs/knowledge/investigation_commands.md`](./knowledge/investigation_commands.md)を開く
2. 適切なカテゴリに新しいコマンドを追加
3. 用途、使用例、発見できる問題を記述

## 関連ドキュメント

- [開発ルール](./DEVELOPMENT_RULES.md)
- [共通仕様書](./specifications/COMMON_SPEC.md)
- [UI挙動仕様](./specifications/UI_BEHAVIOR.md)
