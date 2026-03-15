import type { CsvParser, CsvTransaction } from "./types";

/**
 * イオン銀行 CSV パーサー
 * フォーマット: 取引日,摘要,お支払い金額,お預かり金額,差引残高
 */
export const aeonBankParser: CsvParser = {
  sourceType: "aeon_bank",

  parse(csvContent: string): CsvTransaction[] {
    const lines = csvContent.split("\n").filter((line) => line.trim());
    const transactions: CsvTransaction[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(",").map((c) => c.replace(/"/g, "").trim());
      if (cols.length < 5) continue;

      const [dateStr, storeName, paymentAmountStr] = cols;

      if (!paymentAmountStr || paymentAmountStr === "") continue;

      const date = new Date(dateStr.replace(/\//g, "-"));
      const amount = Number(paymentAmountStr.replace(/,/g, ""));

      if (Number.isNaN(amount) || amount <= 0 || Number.isNaN(date.getTime()))
        continue;

      transactions.push({ date, amount, storeName });
    }

    return transactions;
  },
};
