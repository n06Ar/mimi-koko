"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Copy, Check, ChevronRight, Plus } from "lucide-react";
import { trpc } from "@/trpc/client";
import { Header } from "@/components/navigation/header";

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

  const settingItems = [
    { label: "口座・カード管理", href: "/accounts" },
    { label: "CSVインポート", href: "/csv/import" },
  ];

  return (
    <div className="bg-[#FAFAF8] min-h-screen">
      <Header title="設定" />

      <div className="flex flex-col gap-4 p-4 pb-24">
        {/* Profile Card */}
        <div className="rounded-2xl bg-white p-4 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C4A882]">
              <span className="text-[18px] font-bold text-white">
                {(me?.name ?? "?")[0]}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="text-[16px] font-semibold text-[#3D3D3D]">{me?.name ?? "—"}</p>
              <p className="text-[13px] text-[#9EA8B0]">{me?.email}</p>
            </div>
          </div>
          <form onSubmit={handleSave} className="flex gap-2">
            <input
              type="text"
              value={name || me?.name || ""}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 rounded-xl px-3 text-[14px] text-[#3D3D3D] outline-none"
              style={{ height: "40px", backgroundColor: "#F8F7F5", border: "1px solid #E0DAD0" }}
              placeholder="名前を変更"
            />
            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="rounded-xl px-4 text-[13px] font-medium text-[#C4A882]"
              style={{ border: "1px solid #C4A882" }}
            >
              {saved ? "保存済み" : "保存"}
            </button>
          </form>
        </div>

        {/* Family Members Card */}
        <div className="rounded-2xl bg-white p-4 flex flex-col gap-3">
          <p className="text-[14px] font-semibold text-[#3D3D3D]">家族メンバー</p>

          {family ? (
            <>
              {/* Invite Code */}
              <div
                className="rounded-[10px] px-3.5 py-2.5 flex items-center justify-between"
                style={{ backgroundColor: "#F9F5EE" }}
              >
                <div>
                  <p className="text-[11px] font-medium text-[#9EA8B0]">招待コード</p>
                  <p className="text-[16px] font-bold text-[#3D3D3D] tracking-wider">{family.inviteCode}</p>
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

              {/* Members */}
              {family.members.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F5F0EA]">
                    <span className="text-[13px] font-bold text-[#C4A882]">
                      {(m.user.name ?? m.user.email ?? "?")[0]}
                    </span>
                  </div>
                  <span className="text-[14px] text-[#3D3D3D]">{m.user.name ?? m.user.email}</span>
                  {m.userId === me?.id && (
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-medium text-[#C4A882]"
                      style={{ backgroundColor: "#F5F0EA" }}
                    >
                      自分
                    </span>
                  )}
                </div>
              ))}

              {/* Share Button */}
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center justify-center gap-2 rounded-xl text-[14px] font-medium text-[#C4A882]"
                style={{ height: "48px", backgroundColor: "#F5F0EA" }}
              >
                {copiedCode ? "コピーしました！" : "招待コードを共有"}
              </button>
            </>
          ) : (
            <>
              <p className="text-[13px] text-[#9EA8B0]">グループに参加していません</p>
              <Link
                href="/family/setup"
                className="flex items-center justify-between px-4 rounded-xl"
                style={{ height: "48px", border: "1px solid #E0DAD0" }}
              >
                <span className="flex items-center gap-2 text-[14px] text-[#3D3D3D]">
                  <Plus size={16} color="#C4A882" />
                  グループを追加
                </span>
                <ChevronRight size={16} color="#9EA8B0" />
              </Link>
            </>
          )}
        </div>

        {/* Settings List Card */}
        <div className="rounded-2xl bg-white overflow-hidden">
          {settingItems.map((item, i) => (
            <Link key={item.href} href={item.href}>
              <div>
                {i > 0 && <div className="h-px mx-4" style={{ backgroundColor: "#F0EDE8" }} />}
                <div className="flex items-center justify-between px-4" style={{ height: "56px" }}>
                  <span className="text-[14px] text-[#3D3D3D]">{item.label}</span>
                  <ChevronRight size={16} color="#9EA8B0" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-[15px] font-semibold text-center w-full py-3"
          style={{ color: "#EF4444" }}
        >
          ログアウト
        </button>
      </div>
    </div>
  );
}
