"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { trpc } from "@/trpc/client";
import { Header } from "@/components/navigation/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  const { data: me } = trpc.user.me.useQuery();
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const utils = trpc.useUtils();

  const updateProfile = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      utils.user.me.invalidate();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) updateProfile.mutate({ name });
  };

  return (
    <div>
      <Header title="設定" />
      <div className="p-4 flex flex-col gap-4">
        <Card padding="md" shadow="sm">
          <h2 className="mb-3 font-semibold text-[#3D3D3D]">プロフィール</h2>
          <p className="mb-3 text-sm text-gray-500">{me?.email}</p>
          <form onSubmit={handleSave} className="flex flex-col gap-3">
            <Input
              label="名前"
              value={name || me?.name || ""}
              onChange={(e) => setName(e.target.value)}
            />
            <Button type="submit" disabled={updateProfile.isPending} size="sm">
              {saved ? "保存しました！" : "保存"}
            </Button>
          </form>
        </Card>

        <Card padding="md" shadow="sm">
          <h2 className="mb-3 font-semibold text-[#3D3D3D]">アカウント</h2>
          <Button
            variant="outline"
            className="w-full border-red-300 text-red-500 hover:bg-red-50"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            ログアウト
          </Button>
        </Card>
      </div>
    </div>
  );
}
