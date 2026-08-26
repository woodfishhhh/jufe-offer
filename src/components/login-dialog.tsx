"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { Modal } from "@/components/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { readApiError } from "@/lib/utils";

type LoginDialogProps = { open: boolean; onClose: () => void };

export function LoginDialog({ open, onClose }: LoginDialogProps) {
  const { setAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const apiError = await readApiError(response);
        setError(apiError.message);
        return;
      }
      setAuthenticated(true);
      setUsername("");
      setPassword("");
      toast.success("已进入管理模式。");
      onClose();
    } catch {
      setError("登录失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} title="管理员登录" onClose={onClose}>
      <form className="space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="admin-username">用户名</Label>
          <Input
            id="admin-username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="管理员用户名"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="admin-password">密码</Label>
          <Input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        {error ? (
          <p className="bg-destructive/10 text-destructive rounded-2xl px-4 py-3 text-center text-sm">
            {error}
          </p>
        ) : null}

        <Button type="submit" disabled={submitting} size="lg" className="w-full">
          {submitting ? "登录中…" : "登录"}
        </Button>
      </form>
    </Modal>
  );
}
