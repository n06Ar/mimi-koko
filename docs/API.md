# API仕様

## 概要

tRPCを使った型安全なAPI。フロントエンドからはtRPCクライアントを通じて呼び出す。
将来のiOS対応を見据えて、REST APIとしても呼び出せる設計にしておく。

## tRPCルーター一覧

### auth（認証）

| プロシージャ | 種類 | 説明 |
|---|---|---|
| `auth.register` | mutation | 新規登録 |
| `auth.me` | query | 現在のユーザー情報取得 |

### family（家族グループ）

| プロシージャ | 種類 | 説明 |
|---|---|---|
| `family.create` | mutation | グループ作成 |
| `family.join` | mutation | 招待コードで参加 |
| `family.get` | query | グループ情報取得 |
| `family.members` | query | メンバー一覧取得 |
| `family.regenerateInviteCode` | mutation | 招待コード再生成 |

### account（口座・カード）

| プロシージャ | 種類 | 説明 |
|---|---|---|
| `account.list` | query | 口座一覧取得 |
| `account.create` | mutation | 口座登録 |
| `account.update` | mutation | 口座更新 |
| `account.delete` | mutation | 口座削除 |

### expense（支出）

| プロシージャ | 種類 | 説明 |
|---|---|---|
| `expense.list` | query | 支出一覧取得（月・フィルター指定） |
| `expense.get` | query | 支出詳細取得 |
| `expense.create` | mutation | 支出登録 |
| `expense.update` | mutation | 支出更新 |
| `expense.delete` | mutation | 支出削除 |
| `expense.classify` | mutation | Ollamaで科目自動分類 |
| `expense.ocr` | mutation | レシートOCR（llava） |
| `expense.summary` | query | 月次サマリー取得 |

### csv（CSVインポート）

| プロシージャ | 種類 | 説明 |
|---|---|---|
| `csv.import` | mutation | CSVインポート・マッチング |
| `csv.history` | query | インポート履歴取得 |
| `csv.matchManually` | mutation | 手動マッチング |

### settlement（精算）

| プロシージャ | 種類 | 説明 |
|---|---|---|
| `settlement.list` | query | 精算一覧取得 |
| `settlement.get` | query | 精算詳細取得 |
| `settlement.create` | mutation | 精算作成（期間指定） |
| `settlement.complete` | mutation | 精算済みにする |
| `settlement.calculate` | query | 精算金額計算（最小送金回数） |

## 主要なinput/output型

### expense.create

```typescript
input: {
  amount: number
  storeName?: string
  category?: string
  date: Date
  accountId?: string
  paymentMethod?: string
  isPrivate: boolean
  memberIds: string[]  // 精算対象メンバーのユーザーID
  shareRatios?: number[]  // 各メンバーの割合（省略時は均等）
}
```

### expense.list

```typescript
input: {
  year: number
  month: number
  isPrivate?: boolean  // 未指定時は全件（自分の非公開も含む）
}

output: {
  expenses: Expense[]
  total: number
}
```

### settlement.calculate

```typescript
input: {
  familyId: string
  periodStart: Date
  periodEnd: Date
}

output: {
  payments: {
    payerId: string
    receiverId: string
    amount: number
  }[]
  total: number
}
```

## Ollama連携

### 科目自動分類（gemma3:4b）

```typescript
// src/lib/ollama.ts
const prompt = `
以下の支出を家計簿の科目に分類してください。
支出: ${storeName} ${amount}円
科目: 食費/交通費/日用品/娯楽/医療/教育/その他
JSON形式で返してください: {"category": "食費"}
`
```

### レシートOCR（llava）

```typescript
// base64エンコードした画像を送信
// 画像はOCR処理後に破棄（保存しない）
const prompt = `
このレシートから以下の情報をJSON形式で抽出してください:
{"storeName": "店名", "amount": 金額(数値), "date": "YYYY-MM-DD"}
`
```

## 精算計算アルゴリズム

最小送金回数で精算金額を計算する。

```typescript
// 各メンバーの収支を計算
// プラス = 受け取るべき金額
// マイナス = 支払うべき金額
// 貪欲法で最小送金回数を算出
```
