# Wiki仕様書 (Wiki Specification)

## 概要

Wikiは、プロジェクトに関するドキュメントやナレッジを管理する機能です。Markdown形式で記述し、リアルタイムプレビューが可能です。

## 関連ファイル

### コンポーネント
- [`src/components/features/wiki/WikiView.jsx`](file:///Users/fumiyatanaka/Google_Antigravity/INCO/app/src/components/features/wiki/WikiView.jsx) - Wikiメインコンポーネント (将来実装)

---

## 1. 画面構成

```
┌─────────────────────────────────────────────────┐
│ [📄 ページ一覧]  │  [編集モード] [プレビュー]  │
├──────────────────┼──────────────────────────────┤
│ 📁 はじめに      │  # ページタイトル            │
│ 📁 仕様書        │                              │
│   └ API仕様      │  ## セクション1              │
│   └ DB設計       │  内容...                     │
│ 📁 議事録        │                              │
│ [+ 新規ページ]   │  ## セクション2              │
│                  │  内容...                     │
└──────────────────┴──────────────────────────────┘
```

---

## 2. 機能仕様

### 2.1 ページ管理

**ページ一覧**:
- ツリー構造で表示
- ドラッグ&ドロップで並び替え
- 階層化可能 (親子関係)

**ページ作成**:
- `+ 新規ページ` ボタン
- タイトルとMarkdown本文を入力
- 親ページの選択可能

**ページ削除**:
- 確認ダイアログ表示
- 子ページがある場合は警告

### 2.2 エディタ

**Markdown編集**:
- リアルタイムプレビュー
- シンタックスハイライト
- 自動保存 (デバウンス)

**サポート記法**:
- 見出し (`#`, `##`, `###`)
- リスト (`-`, `1.`)
- リンク (`[text](url)`)
- 画像 (`![alt](url)`)
- コードブロック (` ``` `)
- テーブル

### 2.3 検索

**全文検索**:
- ページタイトルと本文を検索
- ハイライト表示

---

## 3. データモデル

### 3.1 WikiPages

| カラム名 | 型 | 制約 | 説明 |
|---------|-----|------|------|
| `id` | BIGINT | PK | 自動採番 |
| `project_id` | BIGINT | FK | 所属プロジェクト |
| `parent_id` | BIGINT | FK (nullable) | 親ページID |
| `title` | TEXT | NOT NULL | ページタイトル |
| `content` | TEXT | NOT NULL | Markdown本文 |
| `order` | INTEGER | NOT NULL | 表示順序 |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 作成日時 |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | 更新日時 |

---

## 4. UI/UXパターン

### 4.1 エディタレイアウト

**2カラム**:
- 左: Markdownエディタ
- 右: プレビュー

**切り替え可能**:
- 編集のみ
- プレビューのみ
- 分割表示

### 4.2 自動保存

**実装**:
```javascript
const [content, setContent] = useState('');

useEffect(() => {
    const timer = setTimeout(() => {
        updateWikiPage(pageId, { content });
    }, 1000);
    return () => clearTimeout(timer);
}, [content]);
```

---

## 5. 今後の実装

- [ ] バージョン履歴
- [ ] ページテンプレート
- [ ] コメント機能
- [ ] ページ間リンク
- [ ] 画像アップロード
- [ ] エクスポート (PDF, HTML)

---

## 関連ドキュメント

- [共通仕様書](./COMMON_SPEC.md)
