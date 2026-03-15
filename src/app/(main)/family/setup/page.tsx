"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function FamilySetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const create = trpc.family.create.useMutation({
    onSuccess: () => router.push("/family/invite"),
    onError: (err) => setError(err.message),
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    create.mutate({ name });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAF8] px-4">
      <div className="w-full max-w-sm">
        <Card padding="lg" shadow="md">
          <h1 className="mb-2 text-center text-xl font-bold text-[#3D3D3D]">
            ファミリーを作成
          </h1>
          <p className="mb-6 text-center text-sm text-gray-500">
            家族のグループを作って家計を一緒に管理しましょう
          </p>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input
              label="ファミリー名"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 田中家"
              required
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" disabled={create.isPending} className="w-full">
              {create.isPending ? "作成中..." : "作成する"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => router.push("/family/join")}
              className="text-sm text-[#C4A882] hover:underline"
            >
              招待コードで参加する
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
