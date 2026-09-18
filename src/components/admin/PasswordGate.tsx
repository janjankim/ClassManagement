import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface PasswordGateProps {
  onLogin: (password: string) => Promise<void>;
}

export function PasswordGate({ onLogin }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onLogin(password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mx-auto mt-8 max-w-sm p-6">
      <h2 className="mb-4 text-center text-lg font-bold text-brand-900">관리자 로그인</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="비밀번호"
          autoFocus
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
        />
        {error ? <p className="text-xs text-red-500">{error}</p> : null}
        <Button type="submit" disabled={isSubmitting || password.length === 0}>
          {isSubmitting ? "확인 중..." : "입장"}
        </Button>
      </form>
    </Card>
  );
}
