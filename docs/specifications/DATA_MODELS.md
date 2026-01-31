# データモデル & バリデーション (Data Models & Validation)

## 1. データモデル

### Projects (プロジェクト)
プロジェクトはタスクを管理する最上位の単位です。

| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | 自動採番 |
| `name` | TEXT | NOT NULL | プロジェクト名 |
| `key` | TEXT | **UNIQUE**, NOT NULL | プロジェクトキー (例: `INCO`)。タスク番号のプレフィックスとして使用。 |
| `color` | TEXT | NOT NULL | プロジェクトのテーマカラー (Tailwindクラス名またはHEX) |
| `icon` | TEXT | NULLABLE | プロジェクトのアイコン識別子 (Lucide icon name) |
| `current_task_number` | INTEGER | DEFAULT 0 | 現在のタスク連番の最大値。タスク追加時にインクリメントされる。 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |

### TaskProjects (タスク・プロジェクト関連)
タスクとプロジェクトの多対多関係を管理する中間テーブルです。

| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | 自動採番 |
| `task_id` | BIGINT | FK | タスクID |
| `project_id` | BIGINT | FK | プロジェクトID |
| `position` | INTEGER | DEFAULT 0 | 優先順位（メインプロジェクト判別用） |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |

### Tasks (タスク)
個々の作業アイテムです。

| カラム名 | 型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PK | 自動採番 |
| `project_id` | BIGINT | FK | メインプロジェクト（互換性のため保持、実態は `task_projects` で管理） |
| `key` | TEXT | **UNIQUE**, NOT NULL | タスクキー (例: `INCO-123`)。DBトリガーにより自動生成。 |
| `title` | TEXT | NOT NULL | タスク名 |
| ... | ... | ... | ... |

## 2. バリデーション & 制約ルール

### プロジェクト作成
*   **Key (プロジェクトキー)**:
    *   **許可文字**: 半角英大文字 (`A-Z`) と 数字 (`0-9`) のみ。
    *   **長さ**: (推奨: 2~10文字程度)
    *   **一意性**: システム全体でユニークであること。重複時は登録不可。

### タスク作成
*   **Key (タスクキー)**:
    *   ユーザーによる入力は不可。
    *   システムが `{ProjectKey}-{連番}` の形式で自動生成する。
    *   連番はプロジェクトごとに `1` から開始。
    *   **欠番**: トランザクションロールバック等により、番号が飛ぶことは許容する（厳密な連番管理よりパフォーマンスを優先）。
