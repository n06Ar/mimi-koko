import { randomBytes } from "crypto";

/** 8文字の招待コードを生成する */
export function generateInviteCode(): string {
  return randomBytes(4).toString("hex");
}
