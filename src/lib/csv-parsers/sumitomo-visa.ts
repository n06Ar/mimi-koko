import type { CsvParser, CsvTransaction } from "./types";

/**
 * 三井住友VISAカード CSV パーサー（Shift-JIS 対応）
 * フォーマット: お支払い年月日,ご利用先,ご利用者,支払区分,ご利用金額
 */
export const sumitomoVisaParser: CsvParser = {
  sourceType: "sumitomo_visa",

  parse(csvContent: string): CsvTransaction[] {
    const lines = csvContent.split("\n").filter((line) => line.trim());
    const transactions: CsvTransaction[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.replace(/"/g, "").trim());
      if (cols.length < 5) continue;

      const [dateStr, storeName, , paymentMethod, amountStr] = cols;

      // YYYY/MM/DD または YYYY-MM-DD
      const dateNormalized = dateStr.replace(/\//g, "-");
      const date = new Date(dateNormalized);
      const amount = Number(amountStr.replace(/,/g, ""));

      if (Number.isNaN(amount) || Number.isNaN(date.getTime())) continue;

      transactions.push({ date, amount, storeName, paymentMethod });
    }

    return transactions;
  },
};
