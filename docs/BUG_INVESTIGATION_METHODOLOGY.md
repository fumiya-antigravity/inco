# 最高峰エンジニアのバグ調査メソドロジー

> **調査の哲学**: 「調査は常に不十分である」という前提に立ち、圧倒的な自信を持って「大丈夫」と言えるまで調査を繰り返す。

> **最終更新**: 2026-01-30  
> **実践回数**: 1回  
> **平均調査時間**: 30分  
> **平均修正時間**: 1時間

---

## 実践結果 (2026-01-30: 担当者セレクターバグ)

### 良かった点 ✅

1. **6つのアプローチが非常に有効だった**
   - `./scripts/find-related-files.sh AssigneeSelector`を実行して、関連ファイルを漏れなく特定できた
   - 特にアプローチ2(使用箇所)とアプローチ6(ドキュメント)が役立った
   - **学び**: 自動化スクリプトは必須。手動で6つのアプローチを実行するのは時間がかかる

2. **10個以上の問題を見つける原則が機能した**
   - 最初は「担当者が保存されない」という1つの問題に見えたが、実際には8個の問題があった
   - 問題をカテゴリ分けすることで、根本原因が明確になった
   - **学び**: 「最低10個」という数値目標が、深い調査を促進する

3. **根本原因の特定が早かった**
   - `view_code_item`でupdateTask関数を確認し、早期リターンを即座に発見
   - データベーススキーマとUIの不整合も早期に特定
   - **学び**: コードと仕様書を並行して確認することが重要

4. **実装計画が明確だった**
   - ユーザーに2つの方針(単一vs複数の担当者)を提示し、確認を得てから実装
   - 段階的な実装ではなく、根本的な修正を一気に実施
   - **学び**: 設計判断はユーザーに確認し、承認後は一気に実装する

### 改善点 ⚠️

1. **型定義の確認が後回しになった**
   - TaskDB型にassignee_idがないことに気づくのが遅れた
   - Lintエラーが出てから気づいた
   - **改善策**: Phase 0で型定義ファイルを必ず確認する

2. **ビルド確認のプロセスが不明確だった**
   - npmコマンドのパスが不明確で、複数回失敗
   - 開発サーバーが既に実行中の場合、ビルドは不要という判断が遅れた
   - **改善策**: Phase 0で開発環境の状態を確認する

3. **マイグレーションの実行手順が不足**
   - マイグレーションファイルを作成したが、実行手順が明確でなかった
   - ユーザーに手動実行を依頼したが、自動化できる部分があった
   - **改善策**: マイグレーション作成時に実行コマンドも記載する

4. **テストの自動化が不足**
   - 手動テストのみで、自動テストがない
   - ユニットテストやE2Eテストがあれば、より確実に検証できた
   - **改善策**: 修正と同時にテストコードも作成する

### 統計情報

| 項目 | 時間 | 備考 |
|------|------|------|
| Phase 0: 事前準備 | 5分 | 環境確認、仕様書確認 |
| Phase 1: 関連ファイル特定 | 10分 | 6つのアプローチ実行 |
| Phase 2: 深掘り調査 | 15分 | 8個の問題を発見 |
| Phase 3: 根本原因特定 | 5分 | 早期リターンとスキーマ不整合 |
| Phase 4: 実装計画作成 | 15分 | 2つの方針を提示 |
| Phase 5: 実装 | 1時間 | 7ファイル修正 |
| **合計** | **1時間50分** | |

---

## 目次

1. [基本原則と自律的チェック思考](#基本原則と自律的チェック思考)
2. [関連ファイル特定の多角的アプローチ](#関連ファイル特定の多角的アプローチ)
3. [仕様書との紐付けとナレッジ蓄積](#仕様書との紐付けとナレッジ蓄積)
4. [調査プロセスの完全版](#調査プロセスの完全版)
5. [メンテナンス性・保守性を考慮した実装](#メンテナンス性保守性を考慮した実装)
6. [調査コスト削減のための仕組み](#調査コスト削減のための仕組み)

---

## 基本原則と自律的チェック思考

### 原則1: 表面的な問題だけでなく、システム全体を調査する

#### なぜこの原則が必要か

**根本的な理由**:
- 1つの問題は氷山の一角に過ぎない
- 同じパターンの問題が複数箇所に存在する可能性が高い
- 部分的な修正は別の問題を引き起こす可能性がある
- システムの依存関係を理解しないと根本解決できない

#### 具体的にどうすれば原則を守れているか

**自律的チェック思考**:

```
Q1: 「この問題は本当に1箇所だけか?」
→ 同じパターンを検索: grep -rn "<pattern>" app/src

Q2: 「10個以上の問題を見つけたか?」
→ 問題リストを作成し、カウント
→ 10個未満なら調査不足と判断

Q3: 「すべての関連ファイルを確認したか?」
→ 後述の「関連ファイル特定チェックリスト」を実行

Q4: 「依存関係を理解しているか?」
→ 親コンポーネント、子コンポーネント、Context、Hooksをすべて確認

Q5: 「この修正が他に影響を与えないか?」
→ 影響範囲マップを作成
```

**実践例**:

```bash
# NG: stopPropagationを1箇所見つけて満足
grep -n "stopPropagation" ListView.jsx

# OK: すべてのファイルで検索
find app/src -name "*.jsx" -o -name "*.tsx" | xargs grep -n "stopPropagation"

# EXCELLENT: 複数の観点から検索
# 1. 直接的な使用
grep -rn "stopPropagation" app/src

# 2. イベントハンドラー全体
grep -rn "onClick.*=>" app/src

# 3. 特定のコンポーネント内
grep -rn "CompletionCheckButton" app/src

# 4. プロップの受け渡し
grep -rn "onClick={" app/src
```

---

### 原則2: 実際のコードと状態を確認する

#### なぜこの原則が必要か

**根本的な理由**:
- 記憶は不正確
- task.mdは更新されていない可能性がある
- コードは常に変化している
- 思い込みが最大の敵

#### 具体的にどうすれば原則を守れているか

**自律的チェック思考**:

```
Q1: 「git diffで実際の変更を確認したか?」
→ git diff <file>で確認

Q2: 「変更がコミットされているか、されていないか把握しているか?」
→ git status --shortで確認

Q3: 「ブラウザキャッシュの影響を排除したか?」
→ ハードリフレッシュ(Cmd+Shift+R)を実行

Q4: 「ビルドエラーがないか確認したか?」
→ npm run buildを実行

Q5: 「実際のファイル内容と自分の認識が一致しているか?」
→ view_fileで最新の内容を確認
```

**実践例**:

```bash
# 調査開始時の必須チェック
git status --short                    # 変更ファイル一覧
git diff app/src                      # すべての変更を確認
git log -n 5 --oneline                # 最近のコミット
git branch -v                         # 現在のブランチ

# ファイルごとの詳細確認
git diff app/src/components/features/list/ListView.jsx
git diff app/src/components/features/task/SharedComponents.jsx

# 特定の変更を確認
git diff app/src | grep -A10 -B10 "stopPropagation"
git diff app/src | grep -A10 -B10 "dark:"
```

---

### 原則3: 問題を階層的に分類する

#### なぜこの原則が必要か

**根本的な理由**:
- 優先順位を付けないと効率的に解決できない
- 影響範囲を把握しないと修正順序を誤る
- 問題の関連性を理解しないと根本解決できない

#### 具体的にどうすれば原則を守れているか

**自律的チェック思考**:

```
Q1: 「各問題の影響範囲を把握しているか?」
→ 影響範囲マップを作成

Q2: 「問題間の依存関係を理解しているか?」
→ 依存関係グラフを作成

Q3: 「CRITICALな問題を特定したか?」
→ ユーザー影響度、発生頻度、修正難易度で評価

Q4: 「修正順序は適切か?」
→ 依存関係に基づいて順序を決定

Q5: 「すべての問題をカテゴリ分けしたか?」
→ カテゴリ1(主要機能)、カテゴリ2(副次的)、カテゴリ3(その他)
```

---

## 関連ファイル特定の多角的アプローチ

> **重要**: 「このgrepをかければ大丈夫」ではなく、「このgrepだけでは不安だから、さまざまな観点から関連するファイルを調査する」

### アプローチ1: 直接的な依存関係

#### 1.1 import/exportの追跡

```bash
# コンポーネントがどこでimportされているか
grep -rn "import.*ListView" app/src --include="*.jsx" --include="*.tsx"
grep -rn "import.*SharedComponents" app/src --include="*.jsx" --include="*.tsx"

# 特定の関数/コンポーネントの使用箇所
grep -rn "AssigneeSelector" app/src --include="*.jsx" --include="*.tsx"
grep -rn "CompletionCheckButton" app/src --include="*.jsx" --include="*.tsx"

# Contextの使用箇所
grep -rn "useApp" app/src --include="*.jsx" --include="*.tsx"
grep -rn "AppContext" app/src --include="*.jsx" --include="*.tsx"
```

#### 1.2 プロップの受け渡し

```bash
# 特定のプロップがどこで使われているか
grep -rn "readOnly" app/src --include="*.jsx" --include="*.tsx"
grep -rn "isDetailView" app/src --include="*.jsx" --include="*.tsx"
grep -rn "onClick" app/src --include="*.jsx" --include="*.tsx"

# プロップの型定義
grep -rn "readOnly.*:" app/src --include="*.tsx"
```

### アプローチ2: 機能的な依存関係

#### 2.1 イベントハンドラーの追跡

```bash
# stopPropagationの使用箇所
grep -rn "stopPropagation" app/src --include="*.jsx" --include="*.tsx"

# onClickハンドラー
grep -rn "onClick.*=>" app/src --include="*.jsx" --include="*.tsx"
grep -rn "onClick={(e)" app/src --include="*.jsx" --include="*.tsx"

# その他のイベントハンドラー
grep -rn "onBlur" app/src --include="*.jsx" --include="*.tsx"
grep -rn "onChange" app/src --include="*.jsx" --include="*.tsx"
```

#### 2.2 状態管理の追跡

```bash
# useState
grep -rn "useState" app/src --include="*.jsx" --include="*.tsx"

# useEffect
grep -rn "useEffect" app/src --include="*.jsx" --include="*.tsx"

# Context
grep -rn "useContext" app/src --include="*.jsx" --include="*.tsx"
grep -rn "createContext" app/src --include="*.jsx" --include="*.tsx"
```

### アプローチ3: スタイル的な依存関係

#### 3.1 CSSクラスの追跡

```bash
# dark:クラス
grep -rn "dark:" app/src --include="*.jsx" --include="*.tsx"
grep -rn "className.*dark" app/src --include="*.jsx" --include="*.tsx"

# 特定のTailwindクラス
grep -rn "bg-slate-" app/src --include="*.jsx" --include="*.tsx"
grep -rn "hover:" app/src --include="*.jsx" --include="*.tsx"
```

### アプローチ4: ファイル構造的な依存関係

#### 4.1 ディレクトリ構造の確認

```bash
# 特定のディレクトリ内のすべてのファイル
find app/src/components/features/list -name "*.jsx" -o -name "*.tsx"
find app/src/components/features/task -name "*.jsx" -o -name "*.tsx"

# ファイル名パターンで検索
find app/src -name "*Selector*.jsx"
find app/src -name "*Button*.jsx"
find app/src -name "*Modal*.jsx"
```

#### 4.2 ファイルサイズと更新日時

```bash
# 最近更新されたファイル
find app/src -name "*.jsx" -o -name "*.tsx" | xargs ls -lt | head -20

# 大きなファイル(複雑な可能性が高い)
find app/src -name "*.jsx" -o -name "*.tsx" | xargs ls -lS | head -20
```

### アプローチ5: テスト的な依存関係

#### 5.1 テストファイルの確認

```bash
# テストファイル
find app/src -name "*.test.jsx" -o -name "*.test.tsx"
find app/src -name "*.spec.jsx" -o -name "*.spec.tsx"

# テストで使用されているコンポーネント
grep -rn "ListView" app/src --include="*.test.jsx" --include="*.test.tsx"
```

### アプローチ6: ドキュメント的な依存関係

#### 6.1 仕様書の確認

```bash
# 仕様書の検索
find docs -name "*.md" -type f
grep -rn "ListView" docs
grep -rn "Selector" docs
grep -rn "クリック" docs
```

### 関連ファイル特定チェックリスト

**すべてのアプローチを実行したか確認**:

- [ ] **アプローチ1**: import/export、プロップの受け渡し
- [ ] **アプローチ2**: イベントハンドラー、状態管理
- [ ] **アプローチ3**: CSSクラス、スタイル
- [ ] **アプローチ4**: ディレクトリ構造、ファイルパターン
- [ ] **アプローチ5**: テストファイル
- [ ] **アプローチ6**: 仕様書、ドキュメント

**各アプローチで見つかったファイルを記録**:

```markdown
## 関連ファイル一覧

### アプローチ1: 直接的な依存関係
- ListView.jsx (import元)
- TaskDetailPanel.jsx (import元)
- SharedComponents.jsx (export元)

### アプローチ2: 機能的な依存関係
- ListView.jsx (stopPropagation使用)
- SharedComponents.jsx (stopPropagation使用)
- TaskDetailComponents.jsx (stopPropagation使用)

### アプローチ3: スタイル的な依存関係
- ListView.jsx (dark:クラス24箇所)
- SharedComponents.jsx (dark:クラス35箇所)
...
```

---

## 仕様書との紐付けとナレッジ蓄積

### 仕様書の構造化

#### 1. コンポーネント仕様書

**ファイル**: `docs/specifications/components/<ComponentName>.md`

```markdown
# <ComponentName> 仕様書

## 概要
- **目的**: <コンポーネントの目的>
- **場所**: <ファイルパス>
- **親コンポーネント**: <親コンポーネント一覧>
- **子コンポーネント**: <子コンポーネント一覧>

## プロップ
| プロップ名 | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| task | TaskUI | ✅ | - | タスクオブジェクト |
| readOnly | boolean | ❌ | false | 読み取り専用モード |

## 動作仕様
### 通常モード (readOnly=false)
- クリック時: ドロップダウンを開く
- stopPropagation: 実行する

### 読み取り専用モード (readOnly=true)
- クリック時: 何もしない(親要素に伝播)
- stopPropagation: 実行しない

## 関連ファイル
- **使用箇所**: ListView.jsx, TaskDetailPanel.jsx
- **依存**: AppContext.tsx (updateTask)
- **テスト**: AssigneeSelector.test.jsx

## 過去の問題
### 2026-01-30: ListView でクリックが動作しない
- **原因**: readOnlyプロップがなく、常にstopPropagation
- **解決**: readOnlyプロップを追加
- **関連PR**: #123
```

#### 2. 機能仕様書

**ファイル**: `docs/specifications/features/<FeatureName>.md`

```markdown
# <FeatureName> 機能仕様書

## 概要
- **機能名**: タスク一覧のクリック動作
- **関連コンポーネント**: ListView, TaskDetailPanel, SharedComponents

## 動作フロー
1. ユーザーがタスク行をクリック
2. handleTaskClickが実行される
3. URLパラメータが更新される
4. TaskDetailPanelが開く

## 例外処理
- セレクターをクリック: ドロップダウンが開く(詳細パネルは開かない)
- 完了チェックボックスをクリック: 完了/未完了が切り替わる(詳細パネルは開かない)

## 関連ファイル
- ListView.jsx
- TaskDetailPanel.jsx
- SharedComponents.jsx (AssigneeSelector, TypeSelector, StatusSelector, PrioritySelector)

## 過去の問題
### 2026-01-30: セレクターをクリックしても詳細パネルが開かない
- **原因**: stopPropagationが複数箇所にあり、イベントが伝播しない
- **解決**: セレクターにreadOnlyプロップを追加
```

### ナレッジの蓄積

#### 1. 問題パターンデータベース

**ファイル**: `docs/knowledge/problem_patterns.md`

```markdown
# 問題パターンデータベース

## パターン1: イベント伝播の問題

### 症状
- クリックイベントが親要素に伝播しない
- 期待される動作が発生しない

### 原因
- stopPropagation()の多重使用
- イベントハンドラーの階層構造の理解不足

### 調査方法
1. stopPropagationの使用箇所を検索
   ```bash
   grep -rn "stopPropagation" app/src
   ```
2. イベントハンドラーの階層を確認
3. 各階層でのstopPropagation呼び出しを確認

### 解決策
- 必要最小限の箇所でのみstopPropagationを使用
- readOnlyプロップなどで動作を制御

### 関連問題
- ListView クリック動作 (2026-01-30)
```

#### 2. 調査コマンドライブラリ

**ファイル**: `docs/knowledge/investigation_commands.md`

```markdown
# 調査コマンドライブラリ

## カテゴリ: イベントハンドラー

### stopPropagationの使用箇所
```bash
# すべてのstopPropagation
grep -rn "stopPropagation" app/src --include="*.jsx" --include="*.tsx"

# onClickハンドラー内のstopPropagation
grep -rn "onClick.*stopPropagation" app/src --include="*.jsx" --include="*.tsx"

# 特定のコンポーネント内
grep -n "stopPropagation" app/src/components/features/list/ListView.jsx
```

### 使用例
- ListView クリック動作の調査 (2026-01-30)
- 発見した問題数: 5個
```

---

## 調査プロセスの完全版

### Phase 0: 事前準備 (5分)

#### 0.1 環境確認

```bash
# Git状態
git status --short
git branch -v
git log -n 5 --oneline

# ビルド状態
npm run build

# サーバー状態
curl -s http://localhost:5173 > /dev/null && echo "Server is running"
```

#### 0.2 仕様書の確認

```bash
# 関連する仕様書を検索
find docs/specifications -name "*.md" | xargs grep -l "ListView"
find docs/specifications -name "*.md" | xargs grep -l "Selector"

# 仕様書を読む
view_file docs/specifications/UI_BEHAVIOR.md
view_file docs/specifications/COMMON_SPEC.md
```

#### 0.3 型定義ファイルの確認 ⭐ **重要**

```bash
# 型定義ファイルを確認
view_file app/src/types/task.ts
view_file app/src/types/project.ts

# 関連する型を検索
grep -rn "interface.*Task" app/src/types
grep -rn "type.*Task" app/src/types
```

**チェックリスト**:
- [ ] TaskDB型を確認したか
- [ ] TaskUI型を確認したか
- [ ] DBスキーマと型定義が一致しているか
- [ ] 必要なフィールドがすべて定義されているか

#### 0.4 過去の問題を確認

```bash
# ナレッジベースを検索
grep -rn "ListView" docs/knowledge
grep -rn "stopPropagation" docs/knowledge
```

### Phase 1: 現状把握 (10-15分)

#### 1.1 問題の再現

**チェックリスト**:
- [ ] 問題を実際に再現できるか
- [ ] 再現手順を記録したか
- [ ] スクリーンショット/動画を撮影したか
- [ ] ブラウザのコンソールエラーを確認したか

#### 1.2 変更履歴の確認

```bash
# 最近の変更
git log -n 10 --oneline --all -- app/src/components/features/list/
git log -n 10 --oneline --all -- app/src/components/features/task/

# 特定のファイルの変更履歴
git log -p app/src/components/features/list/ListView.jsx | head -100
```

#### 1.3 現在の実装の確認

```bash
# ファイル構造
view_file_outline app/src/components/features/list/ListView.jsx
view_file_outline app/src/components/features/task/SharedComponents.jsx

# 特定の関数
view_code_item app/src/components/features/list/ListView.jsx handleTaskClick
view_code_item app/src/components/features/task/SharedComponents.jsx AssigneeSelector
```

### Phase 2: 関連ファイルの特定 (20-30分)

**すべてのアプローチを実行**:

```bash
# アプローチ1: 直接的な依存関係
grep -rn "import.*ListView" app/src
grep -rn "import.*SharedComponents" app/src

# アプローチ2: 機能的な依存関係
grep -rn "stopPropagation" app/src
grep -rn "onClick" app/src

# アプローチ3: スタイル的な依存関係
grep -rn "dark:" app/src

# アプローチ4: ファイル構造的な依存関係
find app/src/components/features -name "*.jsx"

# アプローチ5: テスト的な依存関係
find app/src -name "*.test.jsx"

# アプローチ6: ドキュメント的な依存関係
grep -rn "ListView" docs
```

**関連ファイル一覧を作成**:

```markdown
## 関連ファイル一覧 (Phase 2の結果)

### 直接的な依存関係 (6ファイル)
- ListView.jsx
- TaskDetailPanel.jsx
- SharedComponents.jsx
- AppContext.tsx
- ProjectView.jsx
- useTaskSorting.js

### 機能的な依存関係 (3ファイル)
- ListView.jsx (stopPropagation: 2箇所)
- SharedComponents.jsx (stopPropagation: 8箇所)
- TaskDetailComponents.jsx (stopPropagation: 3箇所)

### スタイル的な依存関係 (9ファイル)
- ListView.jsx (dark:: 24箇所)
- SharedComponents.jsx (dark:: 35箇所)
...
```

### Phase 3: 深掘り調査 (30-60分)

#### 3.1 各ファイルの詳細確認

**チェックリスト**:
- [ ] すべての関連ファイルを確認したか
- [ ] 各ファイルの実装を理解したか
- [ ] 依存関係を図示したか
- [ ] 問題箇所をすべて特定したか

#### 3.2 問題の分類

```markdown
## 問題の全体像 (Phase 3の結果)

### カテゴリ1: ListView クリック動作の問題 (5個)

#### 問題1: 完了チェックボックスセルの三重stopPropagation ⚠️ **CRITICAL**
**場所**: ListView.jsx:180-188
**問題点**: セルレベル、onClickハンドラー、CompletionCheckButton内部の三重stopPropagation
**影響**: クリックイベントが親要素に伝播しない
**優先度**: CRITICAL (ユーザー影響度: 高、発生頻度: 常時、修正難易度: 中)

#### 問題2: ...
```

### Phase 4: 根本原因の特定 (20-30分)

#### 4.1 仮説の立案

**仮説リスト**:

```markdown
## 仮説リスト

### 仮説1: stopPropagationの多重使用
**根拠**: grep結果で複数箇所に存在
**検証方法**: 各箇所のstopPropagation呼び出しを確認
**検証結果**: ✅ 確認済み - 三重に呼ばれている

### 仮説2: ブラウザキャッシュ
**根拠**: git diffでは修正されているが動作していない
**検証方法**: ハードリフレッシュ(Cmd+Shift+R)
**検証結果**: ❌ キャッシュクリア後も問題が残る

### 仮説3: ...
```

#### 4.2 根本原因の文書化

```markdown
## 根本原因

### 主原因: stopPropagationの三重使用

**詳細**:
1. セルレベル: `<td onClick={(e) => e.stopPropagation()}>`
2. onClickハンドラー: `onClick={(e) => { e.stopPropagation(); ... }}`
3. CompletionCheckButton内部: `onClick={(e) => { e.stopPropagation(); onClick(); }}`

**なぜこうなったか**:
- 段階的な機能追加で各層でstopPropagationを追加
- 全体の設計を見直さずに部分的に修正
- readOnlyプロップなどの制御機構がなかった

**影響範囲**:
- ListView全体のクリック動作
- TaskDetailPanelの開閉
- ユーザー体験の大幅な低下
```

### Phase 5: 解決策の設計 (15-20分)

#### 5.1 複数の解決策を検討

```markdown
## 解決策の比較

### 案1: セルレベルのstopPropagationを削除
**メリット**: シンプル、影響範囲が小さい
**デメリット**: CompletionCheckButton内部の実装に依存
**評価**: ⭐⭐⭐

### 案2: readOnlyプロップを追加
**メリット**: 明示的、拡張性が高い、保守性が高い
**デメリット**: 複数ファイルの修正が必要
**評価**: ⭐⭐⭐⭐⭐

### 案3: ...
```

#### 5.2 最適な解決策の選択

**選択基準**:
- メンテナンス性
- 保守性
- 拡張性
- 影響範囲
- 実装コスト

**選択結果**: 案2 (readOnlyプロップを追加)

---

## メンテナンス性・保守性を考慮した実装

### 設計原則

#### 1. 単一責任の原則 (SRP)

**NG**:
```jsx
// セルレベルでstopPropagationを制御
<td onClick={(e) => e.stopPropagation()}>
  <AssigneeSelector task={task} />
</td>
```

**OK**:
```jsx
// コンポーネント内部で制御
<td>
  <AssigneeSelector task={task} readOnly={true} />
</td>
```

**理由**: 
- stopPropagationの制御責任をコンポーネント内部に集約
- 親コンポーネントは制御方法を知る必要がない
- 再利用性が高まる

#### 2. 開放閉鎖の原則 (OCP)

**NG**:
```jsx
// 動作を変更するためにコンポーネント内部を修正
export const AssigneeSelector = ({ task, isDetailView = false }) => {
  // ListViewで使う場合は特別な処理...
}
```

**OK**:
```jsx
// プロップで動作を制御
export const AssigneeSelector = ({ task, isDetailView = false, readOnly = false }) => {
  // readOnlyプロップで動作を制御
}
```

**理由**:
- 新しい動作を追加する際にコンポーネント内部を修正しない
- プロップで拡張可能
- 既存の動作に影響を与えない

#### 3. 依存性逆転の原則 (DIP)

**NG**:
```jsx
// ListViewがAssigneeSelectorの内部実装に依存
<td onClick={(e) => {
  // AssigneeSelectorがstopPropagationを呼ぶことを知っている
  e.stopPropagation();
}}>
```

**OK**:
```jsx
// AssigneeSelectorが自分の動作を制御
<AssigneeSelector task={task} readOnly={true} />
```

**理由**:
- 親コンポーネントは子コンポーネントの内部実装を知らない
- 子コンポーネントの実装変更が親に影響しない

### コードレビューチェックリスト

**メンテナンス性**:
- [ ] コンポーネントの責任は明確か
- [ ] 再利用可能か
- [ ] 命名は適切か
- [ ] コメントは必要十分か

**保守性**:
- [ ] 将来の変更に対応できるか
- [ ] テストしやすいか
- [ ] デバッグしやすいか
- [ ] ドキュメントは十分か

**拡張性**:
- [ ] 新しい機能を追加しやすいか
- [ ] プロップで動作を制御できるか
- [ ] 既存の動作に影響を与えないか

---

## 調査コスト削減のための仕組み

### 1. 仕様書の整備

#### 1.1 コンポーネント仕様書テンプレート

**ファイル**: `docs/templates/component_spec_template.md`

```markdown
# <ComponentName> 仕様書

## 基本情報
- **ファイルパス**: 
- **作成日**: 
- **最終更新日**: 
- **担当者**: 

## 概要
<コンポーネントの目的と役割>

## プロップ
| プロップ名 | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|

## 動作仕様
### ケース1: 
### ケース2: 

## 関連ファイル
- **親コンポーネント**: 
- **子コンポーネント**: 
- **使用するContext**: 
- **使用するHooks**: 

## テスト
- **テストファイル**: 
- **カバレッジ**: 

## 過去の問題
### YYYY-MM-DD: <問題タイトル>
- **原因**: 
- **解決**: 
- **関連PR**: 
```

#### 1.2 機能仕様書テンプレート

**ファイル**: `docs/templates/feature_spec_template.md`

```markdown
# <FeatureName> 機能仕様書

## 基本情報
- **機能名**: 
- **作成日**: 
- **最終更新日**: 

## 概要
<機能の目的と概要>

## ユーザーストーリー
- As a <ユーザー>
- I want to <やりたいこと>
- So that <目的>

## 動作フロー
1. 
2. 
3. 

## 例外処理
- ケース1: 
- ケース2: 

## 関連コンポーネント
- 
- 

## テストシナリオ
1. 
2. 

## 過去の問題
### YYYY-MM-DD: <問題タイトル>
```

### 2. ナレッジベースの構築

#### 2.1 問題パターンデータベース

**ファイル**: `docs/knowledge/problem_patterns.md`

**構造**:
```markdown
# 問題パターンデータベース

## パターン<番号>: <パターン名>

### 症状
### 原因
### 調査方法
### 解決策
### 関連問題
### 発生頻度
### 最終発生日
```

#### 2.2 調査コマンドライブラリ

**ファイル**: `docs/knowledge/investigation_commands.md`

**構造**:
```markdown
# 調査コマンドライブラリ

## カテゴリ: <カテゴリ名>

### <コマンド名>
```bash
<コマンド>
```

**用途**: 
**使用例**: 
**発見できる問題**: 
```

### 3. 自動化ツール

#### 3.1 関連ファイル検索スクリプト

**ファイル**: `scripts/find-related-files.sh`

```bash
#!/bin/bash

# 使用方法: ./scripts/find-related-files.sh <ComponentName>

COMPONENT=$1

echo "=== 関連ファイル検索: $COMPONENT ==="

echo "\n## アプローチ1: import/export"
grep -rn "import.*$COMPONENT" app/src --include="*.jsx" --include="*.tsx"

echo "\n## アプローチ2: 使用箇所"
grep -rn "$COMPONENT" app/src --include="*.jsx" --include="*.tsx"

echo "\n## アプローチ3: テストファイル"
find app/src -name "*$COMPONENT*.test.jsx" -o -name "*$COMPONENT*.test.tsx"

echo "\n## アプローチ4: 仕様書"
grep -rn "$COMPONENT" docs
```

#### 3.2 問題検出スクリプト

**ファイル**: `scripts/detect-issues.sh`

```bash
#!/bin/bash

echo "=== 問題検出スクリプト ==="

echo "\n## stopPropagationの多重使用"
grep -rn "stopPropagation" app/src --include="*.jsx" --include="*.tsx" | wc -l

echo "\n## dark:クラスの残存"
grep -rn "dark:" app/src --include="*.jsx" --include="*.tsx" | wc -l

echo "\n## useEffectの依存配列の警告"
# ESLintの警告を確認
npm run lint | grep "useEffect"
```

### 4. 定期的なレビュー

#### 4.1 週次レビュー

**チェックリスト**:
- [ ] 新しい問題パターンを追加したか
- [ ] 仕様書を更新したか
- [ ] ナレッジベースを更新したか
- [ ] 調査コマンドライブラリを更新したか

#### 4.2 月次レビュー

**チェックリスト**:
- [ ] 問題パターンの発生頻度を分析したか
- [ ] 調査コストの推移を確認したか
- [ ] 自動化ツールを改善したか
- [ ] チーム内で知見を共有したか

---

## 実践例: ListView クリック動作の完全調査

### Phase 0: 事前準備

```bash
# 環境確認
git status --short
# 結果: 6ファイルが変更されている

# 仕様書確認
view_file docs/specifications/UI_BEHAVIOR.md
# 結果: ListViewのクリック動作の仕様を確認

# 過去の問題確認
grep -rn "ListView" docs/knowledge
# 結果: 過去に類似の問題なし
```

### Phase 1: 現状把握

```bash
# 問題の再現
# → ブラウザで確認: タスク行をクリックしても詳細が開かない

# 変更履歴
git log -n 10 --oneline -- app/src/components/features/list/ListView.jsx
# 結果: 最近の変更でstopPropagationを削除

# 現在の実装
view_file_outline app/src/components/features/list/ListView.jsx
# 結果: handleTaskClick関数が存在
```

### Phase 2: 関連ファイルの特定

```bash
# アプローチ1-6をすべて実行
# 結果: 19ファイルを特定
```

**関連ファイル一覧**:
- ListView.jsx
- TaskDetailPanel.jsx
- SharedComponents.jsx
- AppContext.tsx
- ProjectView.jsx
- useTaskSorting.js
- useTaskCreation.js
- CompletionCheckButton (SharedComponents内)
- AssigneeSelector (SharedComponents内)
- TypeSelector (SharedComponents内)
- StatusSelector (SharedComponents内)
- PrioritySelector (SharedComponents内)
- ...

### Phase 3: 深掘り調査

**発見した問題: 15個**

### Phase 4: 根本原因の特定

**根本原因**: stopPropagationの三重使用

### Phase 5: 解決策の設計

**選択した解決策**: readOnlyプロップを追加

---

## まとめ

### 調査の質を高めるための心構え

1. **「調査は常に不十分である」という前提**
   - 10個以上の問題を見つけるまで調査を続ける
   - すべてのアプローチを実行する
   - 圧倒的な自信を持って「大丈夫」と言えるまで調査する

2. **複数の観点から調査する**
   - 1つのgrepコマンドだけでは不十分
   - 6つのアプローチすべてを実行
   - 関連ファイルを漏れなく特定

3. **仕様書との紐付け**
   - 調査結果を仕様書に記録
   - ナレッジベースを構築
   - 調査コストを削減

4. **メンテナンス性・保守性を考慮**
   - 設計原則に従う
   - コードレビューチェックリストを使用
   - 将来の変更に対応できる実装

5. **継続的な改善**
   - 定期的なレビュー
   - ナレッジの蓄積
   - 自動化ツールの改善

**最高峰のエンジニアとは**: 圧倒的な調査の深さと、体系的なアプローチ、そして継続的な改善を実践する者である。
