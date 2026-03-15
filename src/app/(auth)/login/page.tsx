"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

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
    <Card padding="lg" shadow="md">
      <h1 className="mb-6 text-center text-2xl font-bold text-[#3D3D3D]">
        MimiKoko
      </h1>
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
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "ログイン中..." : "ログイン"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        アカウントをお持ちでない方は{" "}
        <Link href="/signup" className="text-[#C4A882] hover:underline">
          新規登録
        </Link>
      </p>
    </Card>
  );
}
