export interface Transfer {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

/**
 * 最小送金回数で精算を計算する Greedy アルゴリズム
 *
 * @param balances - ユーザーIDをキー、純バランス（支払額 - 負担額）を値とする Map
 *   正の値 = 受け取り側（他のメンバーに払ってもらっている）
 *   負の値 = 支払い側（他のメンバーへ送金が必要）
 * @returns 送金リスト
 *
 * 計算量: O(N log N)
 */
export function calculateSettlements(
  balances: Map<string, number>
): Transfer[] {
  const transfers: Transfer[] = [];

  // 正（受取）と負（送金）に分ける
  const creditors: { userId: string; amount: number }[] = [];
  const debtors: { userId: string; amount: number }[] = [];

  for (const [userId, balance] of balances) {
    const rounded = Math.round(balance);
    if (rounded > 0) {
      creditors.push({ userId, amount: rounded });
    } else if (rounded < 0) {
      debtors.push({ userId, amount: -rounded }); // 正の値に変換
    }
  }

  // 金額の大きい順にソート
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const creditor = creditors[ci];
    const debtor = debtors[di];

    const transferAmount = Math.min(creditor.amount, debtor.amount);

    if (transferAmount > 0) {
      transfers.push({
        fromUserId: debtor.userId,
        toUserId: creditor.userId,
        amount: transferAmount,
      });
    }

    creditor.amount -= transferAmount;
    debtor.amount -= transferAmount;

    if (creditor.amount === 0) ci++;
    if (debtor.amount === 0) di++;
  }

  return transfers;
}

/**
 * 支出リストからメンバーごとのバランスを計算する
 *
 * @param expenses - 支出リスト（expenseMembers を含む）
 * @returns ユーザーIDをキー、純バランスを値とする Map
 */
export function calculateBalances(
  expenses: Array<{
    userId: string;
    amount: number;
    isPrivate: boolean;
    expenseMembers: Array<{ userId: string; shareRatio: number }>;
  }>
): Map<string, number> {
  const balances = new Map<string, number>();

  const addBalance = (userId: string, delta: number) => {
    balances.set(userId, (balances.get(userId) ?? 0) + delta);
  };

  for (const expense of expenses) {
    // private 支出は精算対象外
    if (expense.isPrivate) continue;

    const members = expense.expenseMembers;
    if (members.length === 0) continue;

    // 支払い者のバランスを増やす（受取側）
    addBalance(expense.userId, expense.amount);

    // 各メンバーの負担額を計算して差し引く
    const totalRatio = members.reduce((sum, m) => sum + m.shareRatio, 0);
    for (const member of members) {
      const share = Math.round(
        expense.amount * (member.shareRatio / totalRatio)
      );
      addBalance(member.userId, -share);
    }
  }

  return balances;
}
