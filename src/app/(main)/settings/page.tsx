"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Copy, Check, ChevronRight, Plus } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Header } from "@/components/navigation/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function SettingsPage() {
  const { data: me } = trpc.user.me.useQuery();
  const { data: family } = trpc.family.getMyFamily.useQuery();
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const utils = trpc.useUtils();

  const handleCopyCode = async () => {
    if (!family) return;
    try {
      await navigator.clipboard.writeText(family.inviteCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      console.error("クリップボードへのコピーに失敗しました");
    }
  };

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
          <h2 className="mb-3 font-semibold text-[#3D3D3D]">家族グループ</h2>

          {family ? (
            <>
              <div className="mb-3 flex items-center justify-between rounded-xl bg-[#F9F5EE] px-4 py-3">
                <div>
                  <p className="text-xs text-gray-400">招待コード</p>
                  <p className="font-mono text-lg font-bold text-[#3D3D3D]">
                    {family.inviteCode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="rounded-lg bg-[#EDE8E0] p-2 text-[#C4A882]"
                  aria-label="招待コードをコピー"
                >
                  {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>

              <div className="mb-3 flex flex-col gap-2">
                {family.members.map((m) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-[#C4A882]" />
                    <span className="text-sm text-[#3D3D3D]">
                      {m.user.name ?? m.user.email}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mb-3 text-sm text-gray-400">
              グループに参加していません
            </p>
          )}

          <Link
            href="/family/setup"
            className="flex w-full items-center justify-between rounded-lg border border-[#E0E0E0] px-4 py-3 text-sm text-[#3D3D3D] hover:bg-gray-50"
          >
            <span className="flex items-center gap-2">
              <Plus size={16} className="text-[#C4A882]" />
              グループを追加
            </span>
            <ChevronRight size={16} className="text-gray-400" />
          </Link>
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
