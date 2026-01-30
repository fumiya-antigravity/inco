# リスト仕様書 (List View Specification)

## 概要

リストビューは、タスクを表形式で表示・管理する画面です。Asana風のデザインで、各フィールドが明確に区切られ、インライン編集が可能です。

## 関連ファイル

### コンポーネント
- [`src/components/features/list/ListView.jsx`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/components/features/list/ListView.jsx) - リストビューメインコンポーネント

### カスタムフック
- [`src/hooks/useTaskSorting.ts`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/hooks/useTaskSorting.ts) - ソートロジック
- [`src/hooks/useTaskCreation.ts`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/hooks/useTaskCreation.ts) - タスク作成ロジック

### 共通コンポーネント
- [`src/components/features/task/SharedComponents.jsx`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/components/features/task/SharedComponents.jsx) - セレクター類

---

## 1. 画面構成

### 1.1 テーブル構造

```
┌──────────────────────────────────────────────────────────────┐
│ ☐ │ キー │ タスク名 │ 担当者 │ 種別 │ ステータス │ 優先度 │ 期限日 │ ⋮ │
├──────────────────────────────────────────────────────────────┤
│ ▼ 未対応 (3)                                    [+]          │
├──────────────────────────────────────────────────────────────┤
│ ☐ │ INCO-1 │ タスク名 │ 👤 │ バグ │ 未対応 │ 高 │ 12/31 │ ⋮ │
│ ☐ │ INCO-2 │ タスク名 │ 👤 │ タスク │ 未対応 │ 中 │ - │ ⋮ │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 カラム構成

| カラム | 幅 | ソート可能 | インライン編集 | 説明 |
|--------|-----|-----------|---------------|------|
| チェックボックス | `w-12` | ❌ | ❌ | 完了チェック |
| キー | `w-20` | ✅ | ❌ | タスクキー (INCO-123) |
| タスク名 | `w-[400px]` | ✅ | ✅ | タスク名 (約50文字幅) |
| 担当者 | `w-40` | ✅ | ✅ | 担当者アイコン |
| 種別 | `w-28` | ✅ | ✅ | バグ/タスク/要望 |
| ステータス | `w-36` | ✅ | ✅ | 未対応/処理中/完了 |
| 優先度 | `w-32` | ✅ | ✅ | 高/中/低 |
| 期限日 | `w-36` | ✅ | ✅ | 期限日 |
| メニュー | `w-12` | ❌ | ❌ | その他メニュー |

---

## 2. 機能仕様

### 2.1 ソート機能

**実装**: [`useTaskSorting`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/hooks/useTaskSorting.ts)

**挙動**:
1. ヘッダーをクリックでソート
2. 同じヘッダーを再クリックで昇順/降順切り替え
3. ソートキーが変わると昇順にリセット

**セカンダリソート**:
- すべてのソートで `created_at` (作成日時) を第2ソートキーとして使用
- 新しいタスクが優先 (降順)

**コード例**:
```javascript
const { sortedTasks, sortKey, sortOrder, handleSort } = useTaskSorting(
    currentProjectTasks,
    'created_at',  // 初期ソートキー
    'desc'         // 初期ソート順
);
```

### 2.2 セクション機能

**表示**:
- セクションヘッダーで視覚的にグループ化
- セクション名 + タスク数を表示
- セクションごとに折りたたみ可能 (将来実装)

**セクションヘッダー**:
```javascript
<tr className="bg-slate-50/80 dark:bg-zinc-900/80">
    <td colSpan="9">
        <div className="flex items-center gap-2">
            <ChevronDown size={14} />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span>{section.title}</span>
            <span className="text-slate-400">({sectionTasks.length})</span>
            <button onClick={() => startInlineCreate(section.id)}>
                <Plus size={16} />
            </button>
        </div>
    </td>
</tr>
```

### 2.3 インライン編集

**タスク名編集**:

**トリガー**:
- タスク名のテキスト部分をクリック

**挙動**:
1. 詳細パネルを開く
2. 同時にインライン編集モードに切り替え
3. `Enter` キーまたはフォーカスアウトで保存
4. `Esc` キーでキャンセル

**実装**:
```javascript
const [editingTaskId, setEditingTaskId] = useState(null);

// 編集開始
<span onClick={() => setEditingTaskId(task.id)}>
    {task.title}
</span>

// 編集中
{editingTaskId === task.id && (
    <input
        autoFocus
        value={task.title}
        onChange={(e) => updateTask(task.id, 'title', e.target.value)}
        onBlur={() => setEditingTaskId(null)}
        onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
            if (e.key === 'Escape') setEditingTaskId(null);
        }}
    />
)}
```

### 2.4 タスク作成

**実装**: [`useTaskCreation`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/hooks/useTaskCreation.ts)

**トリガー**:
- セクションヘッダーの `+` ボタンをクリック

**挙動**:
1. 指定されたセクションに新しいタスクを作成
2. デフォルト値を適用
3. 詳細パネルを自動的に開く

**コード例**:
```javascript
const { createTask } = useTaskCreation();

const startInlineCreate = async (sectionId) => {
    await createTask({
        sectionId: sectionId
    });
};
```

### 2.5 ドラッグ&ドロップ

**機能**:
- タスクをドラッグして別のセクションに移動

**実装**:
```javascript
const [draggedTaskId, setDraggedTaskId] = useState(null);
const [dragOverSectionId, setDragOverSectionId] = useState(null);

// ドラッグ開始
<tr
    draggable
    onDragStart={(e) => setDraggedTaskId(task.id)}
>

// ドロップゾーン
<tr
    onDragOver={(e) => {
        e.preventDefault();
        setDragOverSectionId(section.id);
    }}
    onDrop={(e) => {
        e.preventDefault();
        updateTask(draggedTaskId, 'sectionId', section.id);
        setDraggedTaskId(null);
        setDragOverSectionId(null);
    }}
>
```

---

## 3. UI/UXパターン

### 3.1 クリック挙動

**タスク行のクリック**:
- **タスク名**: 詳細パネル + インライン編集
- **セルの余白**: 詳細パネルのみ
- **セレクター**: そのフィールドのみ編集 (パネルは変更なし)
- **チェックボックス**: 完了切り替え (パネルは変更なし)

**イベント伝播制御**:
```javascript
// セレクターのクリックは行クリックを無効化
<td onClick={(e) => e.stopPropagation()}>
    <StatusSelector task={task} />
</td>
```

### 3.2 ホバー効果

**タスク行**:
```css
hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors
```

**選択中のタスク**:
```css
bg-emerald-50/50 dark:bg-emerald-900/10
```

**ドラッグ中**:
```css
opacity-30 bg-slate-50
```

**ドロップゾーン**:
```css
bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200
```

### 3.3 Asana風デザイン

**境界線**:
- すべてのセルに縦罫線: `border-r border-slate-200 dark:border-zinc-700`
- ヘッダーに下罫線: `border-b border-slate-200 dark:border-zinc-700`

**効果**:
- 各フィールドの境界が明確
- 操作可能な領域が視覚的にわかりやすい

---

## 4. データフロー

### 4.1 タスク取得

```
AppContext
  ↓ currentProjectTasks
ListView
  ↓ useTaskSorting
sortedTasks
  ↓ セクションでフィルタ
sectionTasks
  ↓ レンダリング
TaskRow
```

### 4.2 タスク更新

```
ユーザー操作
  ↓
updateTask(id, field, value)
  ↓ デバウンス (500ms)
AppContext.updateTask
  ↓ 楽観的更新
ローカルstate更新
  ↓ Supabase
データベース更新
```

### 4.3 タスク作成

```
+ ボタンクリック
  ↓
useTaskCreation.createTask
  ↓ デフォルト値適用
TASK_DEFAULTS + overrides
  ↓ AppContext.addTask
楽観的更新 + DB保存
  ↓ 詳細パネル
setSearchParams({ task: id })
```

---

## 5. パフォーマンス最適化

### 5.1 メモ化

**ソート済みタスク**:
```typescript
const sortedTasks = useMemo(() => {
    return [...currentProjectTasks].sort(/* ... */);
}, [currentProjectTasks, sortKey, sortOrder]);
```

**セクションタスク**:
```javascript
const sectionTasks = sortedTasks.filter(task => task.sectionId === section.id);
```

### 5.2 デバウンス

**タイトル更新**:
```javascript
onChange={(e) => {
    // 即座にローカルstate更新
    updateTask(task.id, 'title', e.target.value);
}}
// AppContext内で500msデバウンス
```

---

## 6. アクセシビリティ

### 6.1 キーボード操作

- `Enter`: 編集保存
- `Escape`: 編集キャンセル
- `Tab`: フォーカス移動
- ドラッグ中は `cursor-grab`, `active:cursor-grabbing`

### 6.2 ARIA属性

```html
<button aria-label="タスクを追加" onClick={startInlineCreate}>
    <Plus size={16} />
</button>
```

---

## 7. エラーハンドリング

### 7.1 タスク作成失敗

```javascript
const createdTask = await addTask(newTask);
if (!createdTask) {
    // 楽観的更新をロールバック
    setTasks(prev => prev.filter(t => t.id !== tempId));
    return;
}
```

### 7.2 タスク更新失敗

```javascript
const { error } = await supabase.from('tasks').update(/* ... */);
if (error) {
    console.error('Error updating task:', error);
    // ローカルstateをロールバック
    setTasks(prev => /* 元の値に戻す */);
}
```

---

## 8. 今後の拡張

### 8.1 フィルタリング

- ステータスでフィルタ
- 担当者でフィルタ
- 優先度でフィルタ

### 8.2 バルク操作

- 複数タスクを一括選択
- 一括ステータス変更
- 一括削除

### 8.3 カスタムビュー

- 保存されたフィルタ/ソート設定
- ユーザーごとのビュー設定

---

## 関連ドキュメント

- [共通仕様書](./COMMON_SPEC.md)
- [タスク詳細パネル仕様書](./TASK_DETAIL_SPEC.md)
- [ボード仕様書](./BOARD_SPEC.md)
