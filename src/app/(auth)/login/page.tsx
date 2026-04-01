"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("メールアドレスまたはパスワードが正しくありません");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div
      className="w-full rounded-[20px] bg-white p-8 flex flex-col gap-6"
      style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.094)" }}
    >
      {/* Logo Section */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#C4A882]">
          <Wallet size={28} color="white" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-[28px] font-bold text-[#3D3D3D]">MimiKoko</h1>
          <p className="text-sm text-[#9EA8B0]">家族のお金を一緒に管理</p>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="メールアドレス"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="パスワード"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={loading} className="w-full" style={{ height: "48px" }}>
          {loading ? "ログイン中..." : "ログイン"}
        </Button>
      </form>

      {/* Footer */}
      <div className="flex items-center justify-center gap-1">
        <span className="text-[13px] text-[#9EA8B0]">アカウントをお持ちでない方？</span>
        <Link href="/signup" className="text-[13px] font-semibold text-[#C4A882]">
          新規登録
        </Link>
      </div>
    </div>
  );
}
