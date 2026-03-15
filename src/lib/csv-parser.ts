import type { CsvParser } from "./csv-parsers/types";
import { rakutenCardParser } from "./csv-parsers/rakuten-card";
import { sumitomoVisaParser } from "./csv-parsers/sumitomo-visa";
import { aeonBankParser } from "./csv-parsers/aeon-bank";
import { rakutenBankParser } from "./csv-parsers/rakuten-bank";
import { paypayBankParser } from "./csv-parsers/paypay-bank";

const parsers: CsvParser[] = [
  rakutenCardParser,
  sumitomoVisaParser,
  aeonBankParser,
  rakutenBankParser,
  paypayBankParser,
];

export function getParser(sourceType: string): CsvParser | null {
  return parsers.find((p) => p.sourceType === sourceType) ?? null;
}

export const availableSources = parsers.map((p) => p.sourceType);
