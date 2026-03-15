export interface CsvTransaction {
  date: Date;
  amount: number;
  storeName: string;
  paymentMethod?: string;
}

export interface CsvParser {
  sourceType: string;
  parse(csvContent: string): CsvTransaction[];
}
