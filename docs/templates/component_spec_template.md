# <ComponentName> 仕様書

## 基本情報
- **ファイルパス**: `app/src/components/.../<ComponentName>.jsx`
- **作成日**: YYYY-MM-DD
- **最終更新日**: YYYY-MM-DD
- **担当者**: 

## 概要

<コンポーネントの目的と役割を記述>

## プロップ

| プロップ名 | 型 | 必須 | デフォルト | 説明 |
|-----------|-----|------|-----------|------|
| task | TaskUI | ✅ | - | タスクオブジェクト |
| isDetailView | boolean | ❌ | false | 詳細表示モード |
| readOnly | boolean | ❌ | false | 読み取り専用モード |

## 動作仕様

### ケース1: 通常モード (readOnly=false)
- **動作**: 
- **イベント**: 
- **状態変化**: 

### ケース2: 読み取り専用モード (readOnly=true)
- **動作**: 
- **イベント**: 
- **状態変化**: 

## 関連ファイル

### 親コンポーネント
- [`ListView.jsx`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/components/features/list/ListView.jsx)
- [`TaskDetailPanel.jsx`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/components/features/task/TaskDetailPanel.jsx)

### 子コンポーネント
- なし

### 使用するContext
- [`AppContext.tsx`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/context/AppContext.tsx) - `updateTask`

### 使用するHooks
- `useState` - ドロップダウンの開閉状態
- `useRef` - クリックアウトサイド検出

## 内部状態

```typescript
const [isOpen, setIsOpen] = useState(false);
const containerRef = useRef(null);
```

## イベントハンドラー

### onClick
- **通常モード**: ドロップダウンを開く、`e.stopPropagation()`を実行
- **読み取り専用モード**: 何もしない、イベントを親に伝播

### handleSelect
- 選択した値で`updateTask`を呼び出す
- ドロップダウンを閉じる

## スタイル

### 通常モード
```css
hover:bg-slate-100 cursor-pointer
```

### 読み取り専用モード
```css
cursor-default
```

## テスト

### テストファイル
- `app/src/components/features/task/<ComponentName>.test.jsx`

### テストケース
1. [ ] 通常モードでクリックするとドロップダウンが開く
2. [ ] 読み取り専用モードでクリックしてもドロップダウンが開かない
3. [ ] 選択するとupdateTaskが呼ばれる
4. [ ] クリックアウトサイドでドロップダウンが閉じる

### カバレッジ
- 目標: 80%以上

## 過去の問題

### 2026-01-30: ListViewでクリックが動作しない
- **原因**: readOnlyプロップがなく、常にstopPropagationを実行していた
- **症状**: タスク行をクリックしても詳細パネルが開かない
- **解決**: readOnlyプロップを追加し、読み取り専用モードではstopPropagationを実行しないように修正
- **関連PR**: #XXX
- **影響範囲**: ListView, TaskDetailPanel

## メンテナンス履歴

| 日付 | 変更内容 | 担当者 |
|------|---------|--------|
| 2026-01-30 | readOnlyプロップを追加 | - |

## 備考

<その他の重要な情報>
