"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const signup = trpc.auth.signup.useMutation({
    onSuccess: async () => {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError("登録は完了しましたが、ログインに失敗しました");
      } else {
        router.push("/family/setup");
      }
    },
    onError: (err) => {
      setError(err.message);
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    signup.mutate({ name, email, password });
  }

  return (
    <Card padding="lg" shadow="md">
      <h1 className="mb-6 text-center text-2xl font-bold text-[#3D3D3D]">
        新規登録
      </h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="お名前"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Input
          label="メールアドレス"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="パスワード（8文字以上）"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <Button type="submit" disabled={signup.isPending} className="w-full">
          {signup.isPending ? "登録中..." : "アカウントを作成"}
        </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
        すでにアカウントをお持ちの方は{" "}
        <Link href="/login" className="text-[#C4A882] hover:underline">
          ログイン
        </Link>
      </p>
    </Card>
  );
}
