# 共通仕様書 (Common Specifications)

## 概要

このドキュメントは、INCO プロジェクト管理システム全体で共通して使用される仕様、データモデル、UI/UX パターンを定義します。

## 関連ファイル

### データモデル
- [`src/types/task.ts`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/types/task.ts) - タスク関連の型定義
- [`src/types/project.ts`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/types/project.ts) - プロジェクト関連の型定義

### コンテキスト
- [`src/context/AppContext.tsx`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/context/AppContext.tsx) - アプリケーション全体の状態管理

### ユーティリティ
- [`src/utils/taskMapper.ts`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/utils/taskMapper.ts) - タスクデータ変換
- [`src/constants/taskDefaults.ts`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/constants/taskDefaults.ts) - タスクデフォルト値

---

## 1. データモデル

### 1.1 Projects (プロジェクト)

プロジェクトはタスクを管理する最上位の単位です。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | BIGINT | PK | 自動採番 |
| `name` | TEXT | NOT NULL | プロジェクト名 |
| `key` | TEXT | UNIQUE, NOT NULL | プロジェクトキー (例: `INCO`) |
| `color` | TEXT | NOT NULL | テーマカラー |
| `icon` | TEXT | NULLABLE | アイコン識別子 (Lucide icon name) |
| `current_task_number` | INTEGER | DEFAULT 0 | 現在のタスク連番の最大値 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |

**TypeScript型定義**:
```typescript
// src/types/project.ts
export interface Project {
    id: number;
    name: string;
    key: string;
    color: string;
    icon?: string;
    current_task_number: number;
    created_at: string;
}
```

### 1.2 Tasks (タスク)

個々の作業アイテムです。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | BIGINT | PK | 自動採番 |
| `project_id` | BIGINT | FK | 所属プロジェクト |
| `parent_id` | BIGINT | FK (nullable) | 親タスクID (サブタスク用) |
| `section_id` | BIGINT | FK (nullable) | セクションID |
| `key` | TEXT | UNIQUE, NOT NULL | タスクキー (例: `INCO-123`) |
| `title` | TEXT | NOT NULL | タスク名 |
| `description` | TEXT | NULLABLE | 説明 |
| `status_id` | BIGINT | FK | ステータスID |
| `priority_id` | BIGINT | FK (nullable) | 優先度ID |
| `type_id` | BIGINT | FK (nullable) | 種別ID |
| `due_date` | DATE | NULLABLE | 期限日 |
| `completed` | BOOLEAN | DEFAULT false | 完了フラグ |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |

**TypeScript型定義**:
```typescript
// src/types/task.ts
export interface TaskDB {
    id: number;
    project_id: number;
    parent_id: number | null;
    section_id: number | null;
    key: string;
    title: string;
    description: string | null;
    status_id: number;
    priority_id: number | null;
    type_id: number | null;
    due_date: string | null;
    completed: boolean;
    created_at: string;
    updated_at: string;
    activities: Activity[];
}

export interface TaskUI {
    // DB fields
    id: number;
    project_id: number;
    parent_id: number | null;
    section_id: number | null;
    key: string;
    title: string;
    description: string | null;
    status_id: number;
    priority_id: number | null;
    type_id: number | null;
    due_date: string | null;
    completed: boolean;
    created_at: string;
    updated_at: string;
    activities: Activity[];
    
    // UI-specific fields
    projectIds: number[];
    sectionId: string;
    due: string | null;
    assignees: string[];
    status: string;
    priority: string;
    type: string;
}
```

### 1.3 Sections (セクション)

タスクをグループ化するための区分です。

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | BIGINT | PK | 自動採番 |
| `project_id` | BIGINT | FK | 所属プロジェクト |
| `title` | TEXT | NOT NULL | セクション名 |
| `order` | INTEGER | NOT NULL | 表示順序 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |

**TypeScript型定義**:
```typescript
// src/types/project.ts
export interface Section {
    id: string;
    title: string;
    project_id: number;
    order: number;
    created_at: string;
}
```

---

## 2. バリデーション & 制約ルール

### 2.1 プロジェクト作成

**Key (プロジェクトキー)**:
- **許可文字**: 半角英大文字 (`A-Z`) と 数字 (`0-9`) のみ
- **長さ**: 推奨 2~10文字程度
- **一意性**: システム全体でユニーク。重複時は登録不可
- **UI挙動**: 小文字入力時は自動的に大文字に変換

### 2.2 タスク作成

**Key (タスクキー)**:
- ユーザーによる入力は不可
- システムが `{ProjectKey}-{連番}` の形式で自動生成
- 連番はプロジェクトごとに `1` から開始
- **欠番**: トランザクションロールバック等により番号が飛ぶことは許容

---

## 3. タスク項目と初期値

### 3.1 担当者 (Assignee)

- **初期値**: `未割当` (Unassigned)
- **データ型**: `string[]` (配列)
- **挙動**: クリックで入力フィールド表示、ユーザー名を入力して候補から選択

**実装ファイル**:
- [`src/components/features/task/SharedComponents.jsx`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/components/features/task/SharedComponents.jsx) - `AssigneeSelector`

### 3.2 種別 (Type)

- **初期値**: `未選択` (Unselected)
- **選択肢**: `バグ` (Bug), `タスク` (Task), `要望` (Feature), `その他` (Other)
- **データ型**: `string`

**実装ファイル**:
- [`src/components/features/task/SharedComponents.jsx`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/components/features/task/SharedComponents.jsx) - `TypeSelector`

### 3.3 ステータス (Status)

- **初期値**: `未対応` (Not Started)
- **選択肢**: `未対応`, `処理中`, `完了`
- **データ型**: `string`

**実装ファイル**:
- [`src/components/features/task/SharedComponents.jsx`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/components/features/task/SharedComponents.jsx) - `StatusSelector`

### 3.4 優先度 (Priority)

- **初期値**: `未選択` (Unselected)
- **選択肢**: `高` (High), `中` (Medium), `低` (Low)
- **データ型**: `string`

**実装ファイル**:
- [`src/components/features/task/SharedComponents.jsx`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/components/features/task/SharedComponents.jsx) - `PrioritySelector`

### 3.5 期限日 (Due Date)

- **初期値**: `未設定` (No Date)
- **データ型**: `string | null` (ISO 8601形式)
- **挙動**: クリックでカレンダーピッカー表示、日付の直接入力も可能

---

## 4. 共通UI/UXパターン

### 4.1 タスクキー表示

- タスクの識別子として `INCO-123` のような形式で常に表示
- フォント: `font-mono` (等幅フォント)
- 色: `text-slate-500 dark:text-slate-400`

### 4.2 インライン編集

**基本パターン**:
1. フィールドをクリック → 編集モード
2. `Enter` キーまたはフォーカスアウトで保存
3. `Esc` キーでキャンセル

**実装例**:
```javascript
const [editingTaskId, setEditingTaskId] = useState(null);

// 編集開始
onClick={() => setEditingTaskId(task.id)}

// 保存
onBlur={() => {
    updateTask(task.id, 'title', value);
    setEditingTaskId(null);
}}

// キャンセル
onKeyDown={(e) => {
    if (e.key === 'Escape') setEditingTaskId(null);
}}
```

### 4.3 楽観的更新 (Optimistic Update)

タスク作成・更新時は楽観的更新を使用してUXを向上:

```javascript
// 1. 一時データを即座にUIに反映
const tempTask = { id: Date.now(), ...newTask };
setTasks(prev => [tempTask, ...prev]);

// 2. サーバーに保存
const { data, error } = await supabase.from('tasks').insert([payload]);

// 3. エラー時はロールバック
if (error) {
    setTasks(prev => prev.filter(t => t.id !== tempTask.id));
}
```

**実装ファイル**:
- [`src/context/AppContext.tsx`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/context/AppContext.tsx) - `addTask`, `updateTask`

### 4.4 ダークモード対応

すべてのコンポーネントでダークモードをサポート:

```css
/* ライトモード */
bg-white text-slate-700 border-slate-200

/* ダークモード */
dark:bg-zinc-800 dark:text-slate-200 dark:border-zinc-700
```

---

## 5. カスタムフック

### 5.1 useTaskCreation

タスク作成ロジックを一元管理。

**実装ファイル**:
- [`src/hooks/useTaskCreation.ts`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/hooks/useTaskCreation.ts)

**使用例**:
```typescript
const { createTask } = useTaskCreation();

await createTask({
    title: 'New Task',
    sectionId: '1',
    priority: '高'
});
```

### 5.2 useTaskSorting

タスクのソート状態とロジックを管理。

**実装ファイル**:
- [`src/hooks/useTaskSorting.ts`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/hooks/useTaskSorting.ts)

**使用例**:
```typescript
const { sortedTasks, sortKey, sortOrder, handleSort } = useTaskSorting(
    tasks,
    'created_at',
    'desc'
);
```

---

## 6. データ変換

### 6.1 TaskMapper

データベース形式 (snake_case) と UI形式 (camelCase) の変換を処理。

**実装ファイル**:
- [`src/utils/taskMapper.ts`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/utils/taskMapper.ts)

**主要メソッド**:
- `toUI(taskDB)` - TaskDB → TaskUI
- `toDB(taskUI)` - TaskUI → CreateTaskPayload
- `createTempTask(overrides, tempId)` - 一時タスク作成

---

## 7. 定数

### 7.1 タスクデフォルト値

**実装ファイル**:
- [`src/constants/taskDefaults.ts`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/constants/taskDefaults.ts)

```typescript
export const TASK_DEFAULTS = {
    title: '',
    status: '未対応',
    priority: '未選択',
    type: '未選択',
    completed: false,
    assignees: [],
    due: null,
};
```

---

## 8. スタイルガイド

### 8.1 色

**プライマリカラー**: Emerald (緑)
- `bg-emerald-500`, `text-emerald-600`, `border-emerald-200`

**背景色**:
- ライト: `bg-white`, `bg-slate-50`
- ダーク: `bg-zinc-800`, `bg-zinc-900`

**テキスト色**:
- ライト: `text-slate-700`, `text-slate-500`
- ダーク: `text-slate-200`, `text-slate-400`

### 8.2 境界線

**Asana風デザイン**:
- すべてのテーブルセルに縦罫線: `border-r border-slate-200 dark:border-zinc-700`
- ヘッダーに下罫線: `border-b border-slate-200 dark:border-zinc-700`

### 8.3 アニメーション

**フェードイン**:
```css
animate-in fade-in duration-300
```

**ホバー効果**:
```css
hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors
```

---

## 9. アクセシビリティ

### 9.1 キーボードナビゲーション

- `Enter`: 保存・確定
- `Escape`: キャンセル
- `Tab`: フォーカス移動

### 9.2 ARIA属性

```html
<button aria-label="タスクを追加">
    <Plus size={16} />
</button>
```

---

## 10. パフォーマンス最適化

### 10.1 メモ化

```typescript
const sortedTasks = useMemo(() => {
    return [...tasks].sort(/* ... */);
}, [tasks, sortKey, sortOrder]);
```

### 10.2 デバウンス

```typescript
const debounceTimers: Record<string, NodeJS.Timeout> = {};

const debouncedUpdate = (id: number, field: string, value: any) => {
    if (debounceTimers[`${id}-${field}`]) {
        clearTimeout(debounceTimers[`${id}-${field}`]);
    }
    debounceTimers[`${id}-${field}`] = setTimeout(() => {
        updateTask(id, field, value);
    }, 500);
};
```

---

## 関連ドキュメント

- [リスト仕様書](./LIST_SPEC.md)
- [ボード仕様書](./BOARD_SPEC.md)
- [Wiki仕様書](./WIKI_SPEC.md)
- [ヘッダー仕様書](./HEADER_SPEC.md)
- [サイドバー仕様書](./SIDEBAR_SPEC.md)
