"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Wallet } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div
      className="w-full rounded-[20px] bg-white px-8 py-7 flex flex-col gap-5"
      style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.094)" }}
    >
      {/* Logo Section */}
      <div className="flex flex-col items-center gap-2.5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#C4A882]">
          <Wallet size={24} color="white" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-[26px] font-bold text-[#3D3D3D]">MimiKoko</h1>
          <p className="text-sm text-[#9EA8B0]">はじめまして！</p>
        </div>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
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
        <Button type="submit" disabled={signup.isPending} className="w-full" style={{ height: "48px" }}>
          {signup.isPending ? "登録中..." : "アカウントを作成"}
        </Button>
      </form>

      {/* Footer */}
      <div className="flex items-center justify-center gap-1">
        <span className="text-[13px] text-[#9EA8B0]">すでにアカウントをお持ちの方？</span>
        <Link href="/login" className="text-[13px] font-semibold text-[#C4A882]">
          ログイン
        </Link>
      </div>
    </div>
  );
}
