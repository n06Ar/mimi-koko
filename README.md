# 🐱 MimiKoko

> 家族のお金を一緒に管理する家計簿アプリ

## 概要

MimiKokoは家族・夫婦向けのプライベート家計簿アプリです。
支出の記録・精算・科目の自動分類をシンプルに管理できます。

## 機能

- 📒 **家計簿** - 収支の記録・管理・グラフ表示
- 💰 **精算** - 家族間の立替精算を自動計算（公開支出のみ対象）
- 🤖 **科目自動分類** - Ollamaによる支出カテゴリの自動分類
- 📷 **レシートOCR** - 撮影するだけで金額・店名・日付を自動取得
- 📥 **CSVインポート** - 各銀行・クレジットカードの明細に対応
- 🔗 **レシート仮記録 × クレカ明細マッチング** - 購入時に仮記録→明細取込時に自動照合して確定

## 技術スタック

### フロントエンド / バックエンド
| 技術 | 用途 |
|---|---|
| [Next.js](https://nextjs.org/) (App Router) | フロントエンド・APIサーバー |
| [TypeScript](https://www.typescriptlang.org/) | 型安全な開発 |
| [tRPC](https://trpc.io/) | 型安全なAPI通信 |
| [Prisma](https://www.prisma.io/) | ORM |
| [PostgreSQL](https://www.postgresql.org/) | データベース |
| [NextAuth.js](https://next-auth.js.org/) | 認証 |

### AI / インフラ
| 技術 | 用途 |
|---|---|
| [Ollama](https://ollama.ai/) | 科目自動分類・レシートOCR（llava） |
| [Tailscale](https://tailscale.com/) | 自宅サーバーへの安全なアクセス |

## 家族グループ仕様

- 3〜4人（子供含む）を想定
- 全員同じ権限
- 口座・支出を個人で非公開にできる（非公開＝精算対象外）
- 支出ごとに精算対象メンバーを個別指定可能

## セットアップ

### 必要な環境

- Node.js 20+
- PostgreSQL
- Ollama（自宅サーバー）
- Tailscale

### インストール

```bash
# リポジトリのクローン
git clone https://github.com/your-username/mimikoko.git
cd mimikoko

# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
```

### 環境変数

```env
# データベース
DATABASE_URL="postgresql://user:password@localhost:5432/mimikoko"

# NextAuth.js
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"

# Ollama（Tailscale経由）
OLLAMA_BASE_URL="http://your-tailscale-ip:11434"
```

### データベースのセットアップ

```bash
# マイグレーションの実行
npx prisma migrate dev

# Prisma Studioで確認（任意）
npx prisma studio
```

### 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアプリにアクセスできます。

## ディレクトリ構成

```
mimikoko/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/           # 認証系画面
│   │   ├── (dashboard)/      # メイン画面
│   │   └── api/              # API Routes
│   ├── server/
│   │   ├── routers/          # tRPCルーター
│   │   └── trpc.ts
│   ├── lib/
│   │   ├── ollama.ts         # Ollama連携
│   │   └── csv-parser.ts     # CSVパーサー
│   └── components/           # UIコンポーネント
├── prisma/
│   └── schema.prisma         # DBスキーマ
├── design.pen                # Pencilデザインファイル
└── README.md
```

## データベース設計

主要テーブル一覧：

- `families` - 家族グループ
- `users` - ユーザー
- `family_members` - 家族メンバー（中間テーブル）
- `accounts` - 口座・カード情報
- `expenses` - 支出記録
- `expense_members` - 精算対象メンバー
- `settlements` - 精算
- `settlement_items` - 精算明細
- `csv_imports` - CSVインポート履歴

## 将来の予定

- [ ] iOSアプリ（Swift）の開発
- [ ] 金融機関API連携（Moneytree LINK等）
- [ ] 予算管理機能
- [ ] 支出レポート・分析機能

