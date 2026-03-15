import type { CsvParser, CsvTransaction } from "./types";

/**
 * 楽天銀行 CSV パーサー
 * フォーマット: 取引日,入出金(円),残高(円),入出金先,メモ
 */
export const rakutenBankParser: CsvParser = {
  sourceType: "rakuten_bank",

  parse(csvContent: string): CsvTransaction[] {
    const lines = csvContent.split("\n").filter((line) => line.trim());
    const transactions: CsvTransaction[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.replace(/"/g, "").trim());
      if (cols.length < 4) continue;

      const [dateStr, amountStr, , storeName] = cols;

      const date = new Date(dateStr.replace(/\//g, "-"));
      const amount = Number(amountStr.replace(/,/g, ""));

      // 出金（負の値）のみ対象
      if (Number.isNaN(amount) || amount >= 0 || Number.isNaN(date.getTime()))
        continue;

      transactions.push({ date, amount: Math.abs(amount), storeName });
    }

    return transactions;
  },
};
