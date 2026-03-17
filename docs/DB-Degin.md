# DB設計

## テーブル一覧

| テーブル名 | 概要 |
|---|---|
| families | 家族グループ |
| users | ユーザー |
| family_members | 家族メンバー（中間テーブル） |
| accounts | 口座・カード情報 |
| expenses | 支出記録 |
| expense_members | 精算対象メンバー |
| settlements | 精算 |
| settlement_items | 精算明細 |
| csv_imports | CSVインポート履歴 |

## テーブル詳細

### families（家族グループ）

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| name | String | グループ名（例：田中家） |
| invite_code | String | 招待コード（ユニーク） |
| created_at | DateTime | 作成日時 |

### users（ユーザー）

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| name | String | 表示名 |
| email | String | メールアドレス（ユニーク） |
| password_hash | String | パスワードハッシュ |
| created_at | DateTime | 作成日時 |

### family_members（家族メンバー）

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| family_id | UUID | FK → families |
| user_id | UUID | FK → users |
| joined_at | DateTime | 参加日時 |

- `family_id + user_id` でユニーク制約

### accounts（口座・カード）

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users |
| name | String | 表示名（例：楽天カード） |
| account_type | String | `bank` / `credit_card` / `e_money` / `cash` |
| provider_name | String? | 金融機関名（例：楽天銀行） |
| last4_digits | String? | カード番号末尾4桁 |
| billing_day | Int? | 締め日（クレカ） |
| closing_day | Int? | 引き落とし日（クレカ） |
| is_private | Boolean | 非公開フラグ |
| created_at | DateTime | 作成日時 |

### expenses（支出記録）

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users |
| account_id | UUID? | FK → accounts |
| matched_expense_id | UUID? | FK → expenses（自己参照）|
| amount | Int | 金額（円） |
| store_name | String? | 店名・メモ |
| category | String? | 科目（Ollamaで自動分類） |
| date | DateTime | 支出日 |
| payment_method | String? | 支払い方法 |
| status | String | `pending`（仮）/ `confirmed`（確定） |
| is_private | Boolean | 非公開フラグ（精算対象外になる） |
| created_at | DateTime | 作成日時 |

**ステータスの仕様**
- `pending` - レシートで仮記録済み、クレカ明細と未マッチ
- `confirmed` - 確定済み（手入力またはマッチング完了）

**非公開フラグの仕様**
- `is_private = true` → 他メンバーに非表示、精算対象外
- `is_private = false` → 他メンバーに表示、expense_membersで精算対象を個別指定

### expense_members（精算対象メンバー）

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| expense_id | UUID | FK → expenses |
| user_id | UUID | FK → users |
| share_ratio | Float | 割合（デフォルト1.0） |

- `expense_id + user_id` でユニーク制約
- 支出ごとに精算対象メンバーを個別指定できる

### settlements（精算）

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| family_id | UUID | FK → families |
| period_start | DateTime | 精算期間開始 |
| period_end | DateTime | 精算期間終了 |
| status | String | `pending` / `completed` |
| created_at | DateTime | 作成日時 |

### settlement_items（精算明細）

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| settlement_id | UUID | FK → settlements |
| expense_id | UUID | FK → expenses |
| payer_id | UUID | FK → users（支払う人） |
| receiver_id | UUID | FK → users（受け取る人） |
| amount | Int | 金額（円） |

### csv_imports（CSVインポート履歴）

| カラム | 型 | 説明 |
|---|---|---|
| id | UUID | PK |
| user_id | UUID | FK → users |
| source_type | String | `rakuten_card` / `smbc` / `aeon_bank` など |
| status | String | `pending` / `completed` / `failed` |
| matched_count | Int | マッチング済み件数 |
| unmatched_count | Int | 未マッチ件数 |
| imported_at | DateTime | インポート日時 |

## ER図

```
families
  ↑ 1対多
family_members ←→ users
                      ↓ 1対多
                   accounts
                      ↓ 1対多（account_idはnullable）
                   expenses ←→ expense_members ←→ users
                      ↓ 多対多
                   settlement_items
                      ↓
                   settlements
                      ↑
                   families
```

## マッチングロジック（レシート仮記録 × クレカ明細）

```typescript
// 照合条件
const isMatch = (receipt: Expense, statement: Expense) => {
  const amountMatch = receipt.amount === statement.amount
  const dateMatch = Math.abs(
    dayjs(receipt.date).diff(statement.date, 'day')
  ) <= 3  // クレカは数日ズレることがある
  
  return amountMatch && dateMatch
}
```
