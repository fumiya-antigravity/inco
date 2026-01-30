# サイドバー仕様書 (Sidebar Specification)

## 概要

サイドバーはプロジェクト一覧、ナビゲーション、設定へのアクセスを提供します。

## 関連ファイル

### コンポーネント
- [`src/components/layout/Sidebar.jsx`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/components/layout/Sidebar.jsx) - サイドバーメインコンポーネント

---

## 1. 画面構成

```
┌─────────────────┐
│ INCO            │
├─────────────────┤
│ 🏠 ホーム       │
│                 │
│ プロジェクト ▼  │
│  📁 Project 1   │
│  📁 Project 2   │
│  [+] 新規       │
│                 │
│ ⚙️ 設定         │
│ 🌙 ダークモード │
└─────────────────┘
```

### 1.1 ヘッダー

**ロゴ/アプリ名**:
- アプリケーション名を表示
- クリックでホームに遷移

### 1.2 ナビゲーション

**ホーム**:
- アイコン: `Home` (Lucide)
- `/` に遷移

**プロジェクト一覧**:
- 折りたたみ可能
- プロジェクトアイコン + 名前
- クリックでプロジェクトビューに遷移

**新規プロジェクト**:
- `+` ボタン
- クリックでプロジェクト作成モーダル表示

### 1.3 フッター

**設定**:
- アイコン: `Settings` (Lucide)
- クリックで設定画面表示

**ダークモード切り替え**:
- アイコン: `Moon` / `Sun` (Lucide)
- クリックでダークモード切り替え

---

## 2. 機能仕様

### 2.1 プロジェクト一覧

**実装**:
```javascript
const { projects, activeProjectId, setActiveProjectId } = useApp();

{projects.map(project => (
    <button
        key={project.id}
        onClick={() => {
            setActiveProjectId(project.id);
            navigate(`/project/${project.id}/list`);
        }}
        className={activeProjectId === project.id ? 'active' : ''}
    >
        {project.icon && <Icon name={project.icon} />}
        {project.name}
    </button>
))}
```

**アクティブ状態**:
- 背景色: `bg-emerald-50 dark:bg-emerald-900/20`
- テキスト色: `text-emerald-600 dark:text-emerald-400`
- 左ボーダー: `border-l-4 border-emerald-500`

### 2.2 折りたたみ

**実装**:
```javascript
const [projectsCollapsed, setProjectsCollapsed] = useState(false);

<button onClick={() => setProjectsCollapsed(!projectsCollapsed)}>
    {projectsCollapsed ? <ChevronRight /> : <ChevronDown />}
    プロジェクト
</button>

{!projectsCollapsed && (
    <div>
        {/* プロジェクト一覧 */}
    </div>
)}
```

### 2.3 レスポンシブ対応

**デスクトップ** (md以上):
- 常に表示
- 幅: `w-64` (256px)

**モバイル** (md未満):
- オーバーレイ表示
- 背景クリックで閉じる
- 幅: `w-64` (256px)

---

## 3. スタイル仕様

### 3.1 レイアウト

```css
width: 256px
height: 100vh
background: white dark:bg-zinc-900
border-right: 1px solid slate-200 dark:border-zinc-800
```

### 3.2 ナビゲーションアイテム

**通常**:
```css
px-4 py-2
text-slate-700 dark:text-slate-300
hover:bg-slate-50 dark:hover:bg-zinc-800
transition-colors
```

**アクティブ**:
```css
bg-emerald-50 dark:bg-emerald-900/20
text-emerald-600 dark:text-emerald-400
border-l-4 border-emerald-500
```

---

## 関連ドキュメント

- [共通仕様書](./COMMON_SPEC.md)
- [ヘッダー仕様書](./HEADER_SPEC.md)
