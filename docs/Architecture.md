# アーキテクチャ

## 概要

MimiKokoは家族向けのプライベート家計簿アプリです。
センシティブな家計データを外部に送らないよう、自宅サーバーで完結する設計になっています。

## 技術スタック

### フロントエンド / バックエンド

| 技術 | バージョン | 用途 |
|---|---|---|
| Next.js (App Router) | 16.x | フロントエンド・APIサーバー |
| TypeScript | 5.x | 型安全な開発 |
| tRPC | 11.x | 型安全なAPI通信 |
| Prisma | 7.x | ORM |
| PostgreSQL | 17.x | データベース |
| NextAuth.js | 5.x (beta) | 認証 |
| Tailwind CSS | 4.x | スタイリング |
| Biome | 2.x | Linter / Formatter |
| pnpm | latest | パッケージマネージャー |

### AI / インフラ

| 技術 | 用途 |
|---|---|
| Ollama (gemma3:4b) | 科目自動分類 |
| Ollama (llava) | レシートOCR |
| Tailscale | 自宅サーバーへの安全なアクセス |
| Devbox | 開発環境管理 |

## システム構成

```
[ブラウザ / iOSアプリ（将来）]
        ↓ HTTPS (Tailscale経由)
[Next.js (App Router)]
├── フロントエンド (React)
└── tRPC API
        ↓
[PostgreSQL (Devbox)]
        ↓
[Ollama (自宅サーバー)]
├── gemma3:4b (科目分類)
└── llava (レシートOCR)
```

## ディレクトリ構成

```
mimi-koko/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # 認証系画面
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── group-setup/
│   │   ├── (dashboard)/        # メイン画面
│   │   │   ├── page.tsx        # ダッシュボード
│   │   │   ├── expenses/       # 支出一覧・登録
│   │   │   ├── settlements/    # 精算
│   │   │   ├── accounts/       # 口座管理
│   │   │   └── settings/       # 設定
│   │   └── api/
│   │       ├── auth/           # NextAuth.js
│   │       └── trpc/           # tRPC handler
│   ├── server/
│   │   ├── trpc.ts             # tRPC初期化
│   │   └── routers/
│   │       ├── _app.ts         # ルーターまとめ
│   │       ├── auth.ts
│   │       ├── family.ts
│   │       ├── expense.ts
│   │       ├── account.ts
│   │       ├── settlement.ts
│   │       └── csv.ts
│   ├── lib/
│   │   ├── prisma.ts           # Prismaクライアント
│   │   ├── ollama.ts           # Ollama連携
│   │   └── csv-parser.ts       # CSVパーサー
│   └── components/
│       ├── ui/                 # 共通UIコンポーネント
│       └── features/           # 機能別コンポーネント
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── docs/                       # ドキュメント
├── design.pen                  # Pencilデザインファイル
├── prisma.config.ts
├── auth.ts                     # NextAuth.js v5設定
├── middleware.ts
└── devbox.json
```

## カラーパレット

| 名前 | カラーコード | 用途 |
|---|---|---|
| Primary | `#C4A882` | ボタン・アクセント（茶トラカラー） |
| Secondary | `#9EA8B0` | サブ要素（サバトラカラー） |
| Accent | `#F4A7B9` | 通知・アラート（首輪ピンク） |
| Background | `#FAFAF8` | 背景色 |
| Text | `#3D3D3D` | テキスト |

## 設計方針

- **プライバシーファースト** - センシティブな家計データは自宅サーバーで完結
- **シンプルな権限設計** - 家族全員が同じ権限、非公開フラグで個人の支出を保護
- **将来のiOS対応を意識** - tRPCで型安全なAPIを設計、後からSwiftクライアントを追加可能
- **AI処理はローカル** - OllamaをTailscale経由で利用、外部APIへのデータ送信なし
