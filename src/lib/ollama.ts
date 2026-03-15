const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const MODEL = "gemma3:4b";
const TIMEOUT_MS = 10_000;

const CATEGORIES = [
  "食費",
  "日用品",
  "交通費",
  "医療",
  "教育",
  "娯楽",
  "住居",
  "光熱費",
  "通信費",
  "衣服",
  "その他",
] as const;

export type ExpenseCategory = (typeof CATEGORIES)[number];

/**
 * 支出のカテゴリを Ollama で分類する
 * タイムアウトや失敗時は null を返す（支出の保存は止めない）
 */
export async function classifyExpenseCategory(
  storeName: string,
  amount: number
): Promise<ExpenseCategory | null> {
  const prompt = `次の支出のカテゴリを以下の選択肢から1つだけ選んでください。選択肢以外の回答は禁止です。
選択肢: ${CATEGORIES.join(", ")}
店名: ${storeName}
金額: ${amount}円
カテゴリ:`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, prompt, stream: false }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = (await response.json()) as { response: string };
    const category = data.response.trim() as ExpenseCategory;

    return CATEGORIES.includes(category) ? category : null;
  } catch {
    return null;
  }
}

/**
 * レシート画像（Base64）から支出情報を OCR で取得する
 */
export async function processReceiptOCR(imageBase64: string): Promise<{
  storeName: string | null;
  amount: number | null;
  date: string | null;
}> {
  const prompt = `このレシート画像から以下の情報をJSON形式で抽出してください。
不明な場合はnullにしてください。
{
  "storeName": "店名",
  "amount": 合計金額（数値のみ）,
  "date": "YYYY-MM-DD形式の日付"
}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        images: [imageBase64],
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return { storeName: null, amount: null, date: null };

    const data = (await response.json()) as { response: string };
    const jsonMatch = data.response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { storeName: null, amount: null, date: null };

    const parsed = JSON.parse(jsonMatch[0]) as {
      storeName?: string;
      amount?: number;
      date?: string;
    };

    return {
      storeName: parsed.storeName ?? null,
      amount: typeof parsed.amount === "number" ? parsed.amount : null,
      date: parsed.date ?? null,
    };
  } catch {
    return { storeName: null, amount: null, date: null };
  }
}
