# 調査コマンドライブラリ

このドキュメントは、バグ調査で頻繁に使用するコマンドをカテゴリ別に整理したライブラリです。

---

## カテゴリ1: Git関連

### 変更ファイル一覧
```bash
git status --short
```
**用途**: 変更されたファイルを確認  
**使用例**: 調査開始時、修正が適用されているか確認  
**発見できる問題**: コミットされていない変更、意図しない変更

### 変更内容の確認
```bash
git diff <file>
```
**用途**: 実際の変更内容を確認  
**使用例**: 修正が正しく適用されているか確認  
**発見できる問題**: 修正漏れ、意図しない変更

### 特定箇所の変更確認
```bash
git diff <file> | grep -A5 -B5 "<keyword>"
```
**用途**: 特定のキーワード周辺の変更を確認  
**使用例**: stopPropagation、dark:などの特定の変更を確認  
**発見できる問題**: 部分的な修正漏れ

### 最近のコミット履歴
```bash
git log -n 10 --oneline
```
**用途**: 最近の変更履歴を確認  
**使用例**: 問題が発生した時期を特定  
**発見できる問題**: 問題を引き起こした変更

### 特定ファイルの変更履歴
```bash
git log -p <file> | head -100
```
**用途**: ファイルの詳細な変更履歴を確認  
**使用例**: 問題の原因となった変更を特定  
**発見できる問題**: 過去の修正パターン、問題の再発

---

## カテゴリ2: イベントハンドラー

### stopPropagationの使用箇所
```bash
# すべてのstopPropagation
grep -rn "stopPropagation" app/src --include="*.jsx" --include="*.tsx"

# onClickハンドラー内のstopPropagation
grep -rn "onClick.*stopPropagation" app/src --include="*.jsx" --include="*.tsx"

# 特定のコンポーネント内
grep -n "stopPropagation" app/src/components/features/list/ListView.jsx
```
**用途**: イベント伝播の問題を調査  
**使用例**: クリックイベントが動作しない問題  
**発見できる問題**: stopPropagationの多重使用、イベント伝播の問題

### onClickハンドラー
```bash
# すべてのonClickハンドラー
grep -rn "onClick.*=>" app/src --include="*.jsx" --include="*.tsx"

# onClick={(e)パターン
grep -rn "onClick={(e)" app/src --include="*.jsx" --include="*.tsx"
```
**用途**: クリックイベントハンドラーの使用箇所を確認  
**使用例**: クリック動作の問題を調査  
**発見できる問題**: イベントハンドラーの実装漏れ、誤った実装

### その他のイベントハンドラー
```bash
# onBlur
grep -rn "onBlur" app/src --include="*.jsx" --include="*.tsx"

# onChange
grep -rn "onChange" app/src --include="*.jsx" --include="*.tsx"

# onKeyDown
grep -rn "onKeyDown" app/src --include="*.jsx" --include="*.tsx"
```
**用途**: 各種イベントハンドラーの使用箇所を確認  
**使用例**: フォーム入力、キーボード操作の問題を調査  
**発見できる問題**: イベントハンドラーの実装漏れ

---

## カテゴリ3: コンポーネント・関数の使用箇所

### importの追跡
```bash
# コンポーネントがどこでimportされているか
grep -rn "import.*ListView" app/src --include="*.jsx" --include="*.tsx"
grep -rn "import.*SharedComponents" app/src --include="*.jsx" --include="*.tsx"
```
**用途**: コンポーネントの使用箇所を特定  
**使用例**: 影響範囲の把握  
**発見できる問題**: 修正漏れ、影響範囲の見落とし

### 特定の関数/コンポーネントの使用箇所
```bash
grep -rn "AssigneeSelector" app/src --include="*.jsx" --include="*.tsx"
grep -rn "CompletionCheckButton" app/src --include="*.jsx" --include="*.tsx"
```
**用途**: 特定のコンポーネントの使用箇所を確認  
**使用例**: コンポーネント修正の影響範囲を把握  
**発見できる問題**: 修正が必要な箇所の特定

### Contextの使用箇所
```bash
grep -rn "useApp" app/src --include="*.jsx" --include="*.tsx"
grep -rn "AppContext" app/src --include="*.jsx" --include="*.tsx"
```
**用途**: グローバルステートの使用箇所を確認  
**使用例**: 状態管理の問題を調査  
**発見できる問題**: Context依存の問題

---

## カテゴリ4: プロップの追跡

### 特定のプロップの使用箇所
```bash
grep -rn "readOnly" app/src --include="*.jsx" --include="*.tsx"
grep -rn "isDetailView" app/src --include="*.jsx" --include="*.tsx"
grep -rn "onClick" app/src --include="*.jsx" --include="*.tsx"
```
**用途**: プロップの使用箇所を確認  
**使用例**: プロップの受け渡しを追跡  
**発見できる問題**: プロップの渡し忘れ、誤った値

### プロップの型定義
```bash
grep -rn "readOnly.*:" app/src --include="*.tsx"
```
**用途**: TypeScriptの型定義を確認  
**使用例**: プロップの型を確認  
**発見できる問題**: 型定義の不一致

---

## カテゴリ5: CSSクラス

### dark:クラス
```bash
# すべてのdark:クラス
grep -rn "dark:" app/src --include="*.jsx" --include="*.tsx"

# 件数を確認
grep -rn "dark:" app/src --include="*.jsx" --include="*.tsx" | wc -l

# ファイルごとの件数
grep -rn "dark:" app/src --include="*.jsx" --include="*.tsx" | cut -d: -f1 | sort | uniq -c | sort -rn
```
**用途**: ダークモードクラスの残存確認  
**使用例**: ダークモード削除の完全性確認  
**発見できる問題**: 削除漏れ

### 特定のTailwindクラス
```bash
grep -rn "bg-slate-" app/src --include="*.jsx" --include="*.tsx"
grep -rn "hover:" app/src --include="*.jsx" --include="*.tsx"
```
**用途**: 特定のスタイルクラスの使用箇所を確認  
**使用例**: スタイルの統一性確認  
**発見できる問題**: スタイルの不統一

---

## カテゴリ6: ファイル構造

### ディレクトリ内のファイル一覧
```bash
find app/src/components/features/list -name "*.jsx" -o -name "*.tsx"
find app/src/components/features/task -name "*.jsx" -o -name "*.tsx"
```
**用途**: 特定のディレクトリ内のファイルを確認  
**使用例**: 影響範囲の把握  
**発見できる問題**: 確認漏れのファイル

### ファイル名パターンで検索
```bash
find app/src -name "*Selector*.jsx"
find app/src -name "*Button*.jsx"
find app/src -name "*Modal*.jsx"
```
**用途**: 命名パターンでファイルを検索  
**使用例**: 関連コンポーネントの特定  
**発見できる問題**: 命名規則の不統一

### 最近更新されたファイル
```bash
find app/src -name "*.jsx" -o -name "*.tsx" | xargs ls -lt | head -20
```
**用途**: 最近変更されたファイルを確認  
**使用例**: 問題が発生した時期のファイルを特定  
**発見できる問題**: 問題を引き起こした変更

---

## カテゴリ7: テスト

### テストファイル
```bash
find app/src -name "*.test.jsx" -o -name "*.test.tsx"
find app/src -name "*.spec.jsx" -o -name "*.spec.tsx"
```
**用途**: テストファイルの存在確認  
**使用例**: テストカバレッジの確認  
**発見できる問題**: テストの不足

### テストで使用されているコンポーネント
```bash
grep -rn "ListView" app/src --include="*.test.jsx" --include="*.test.tsx"
```
**用途**: テストでの使用箇所を確認  
**使用例**: テストの影響範囲を把握  
**発見できる問題**: テストの更新漏れ

---

## カテゴリ8: ドキュメント

### 仕様書の検索
```bash
find docs -name "*.md" -type f
grep -rn "ListView" docs
grep -rn "Selector" docs
grep -rn "クリック" docs
```
**用途**: 仕様書から関連情報を検索  
**使用例**: 仕様の確認  
**発見できる問題**: 仕様との不一致

---

## カテゴリ9: ビルド・サーバー

### ビルドエラーの確認
```bash
npm run build
```
**用途**: ビルドエラーの確認  
**使用例**: 修正後の動作確認  
**発見できる問題**: 構文エラー、型エラー

### サーバーの状態確認
```bash
curl -s http://localhost:5173 > /dev/null && echo "Server is running"
```
**用途**: サーバーが起動しているか確認  
**使用例**: 調査開始時の環境確認  
**発見できる問題**: サーバーの停止

### Lintエラーの確認
```bash
npm run lint
```
**用途**: コードスタイルの問題を確認  
**使用例**: コード品質の確認  
**発見できる問題**: コーディング規約違反

---

## カテゴリ10: 一括操作

### dark:クラスの一括削除
```bash
# すべてのdark:クラスを削除
find app/src -name "*.jsx" -o -name "*.tsx" | xargs sed -i '' 's/ dark:[a-zA-Z0-9_\/-]*//g'

# 複数スペースを1つに整形
find app/src -name "*.jsx" -o -name "*.tsx" | xargs sed -i '' 's/  */ /g'
```
**用途**: CSSクラスの一括削除  
**使用例**: ダークモード削除  
**発見できる問題**: 削除漏れ

---

## 使用例: ListView クリック動作の調査

### Phase 1: 現状把握
```bash
git status --short
git diff app/src/components/features/list/ListView.jsx
```

### Phase 2: 関連ファイルの特定
```bash
grep -rn "import.*ListView" app/src
grep -rn "stopPropagation" app/src
```

### Phase 3: 深掘り調査
```bash
grep -n "stopPropagation" app/src/components/features/list/ListView.jsx
view_code_item app/src/components/features/task/SharedComponents.jsx CompletionCheckButton
```

### Phase 4: 検証
```bash
npm run build
curl -s http://localhost:5173 > /dev/null && echo "Server is running"
```

---

## 更新履歴

| 日付 | 変更内容 | 担当者 |
|------|---------|--------|
| 2026-01-30 | 初版作成 | - |
