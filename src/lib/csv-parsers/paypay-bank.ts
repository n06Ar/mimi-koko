import type { CsvParser, CsvTransaction } from "./types";

/**
 * PayPay銀行 CSV パーサー
 * フォーマット: 日付,内容,出金金額(円),入金金額(円),残高(円)
 */
export const paypayBankParser: CsvParser = {
  sourceType: "paypay_bank",

  parse(csvContent: string): CsvTransaction[] {
    const lines = csvContent.split("\n").filter((line) => line.trim());
    const transactions: CsvTransaction[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.replace(/"/g, "").trim());
      if (cols.length < 5) continue;

      const [dateStr, storeName, withdrawalStr] = cols;

      if (!withdrawalStr || withdrawalStr === "") continue;

      const date = new Date(dateStr.replace(/\//g, "-"));
      const amount = Number(withdrawalStr.replace(/,/g, ""));

      if (Number.isNaN(amount) || amount <= 0 || Number.isNaN(date.getTime()))
        continue;

      transactions.push({ date, amount, storeName });
    }

    return transactions;
  },
};
