import type { CsvParser, CsvTransaction } from "./types";

/**
 * 楽天カード CSV パーサー
 * フォーマット: 利用日,利用店名・商品名,利用者,支払方法,利用金額,支払手数料,支払総額
 */
export const rakutenCardParser: CsvParser = {
  sourceType: "rakuten_card",

  parse(csvContent: string): CsvTransaction[] {
    const lines = csvContent.split("\n").filter((line) => line.trim());
    const transactions: CsvTransaction[] = [];

    // ヘッダー行をスキップ
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.replace(/"/g, "").trim());
      if (cols.length < 7) continue;

      const [dateStr, storeName, , paymentMethod, amountStr] = cols;

      const dateParts = dateStr.split("/");
      if (dateParts.length !== 3) continue;

      const date = new Date(
        Number(dateParts[0]),
        Number(dateParts[1]) - 1,
        Number(dateParts[2])
      );
      const amount = Number(amountStr.replace(/,/g, ""));

      if (Number.isNaN(amount) || Number.isNaN(date.getTime())) continue;

      transactions.push({ date, amount, storeName, paymentMethod });
    }

    return transactions;
  },
};
