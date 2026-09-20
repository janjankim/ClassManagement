import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { NavTabs } from "@/components/NavTabs";
import { AdminMatchList } from "@/components/admin/AdminMatchList";
import { MatchForm } from "@/components/admin/MatchForm";
import { PasswordGate } from "@/components/admin/PasswordGate";
import { Button } from "@/components/ui/Button";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { BOOTSTRAP_QUERY_KEY, useBootstrap } from "@/hooks/useBootstrap";
import { createMatch, deleteMatch, updateMatch } from "@/lib/api";
import type { Match, MatchInput } from "@/lib/types";

export function AdminPage() {
  const { token, isAuthenticated, login, logout } = useAdminAuth();
  const { data, isLoading } = useBootstrap();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState<"closed" | "create" | Match>("closed");

  const invalidate = () => queryClient.invalidateQueries({ queryKey: BOOTSTRAP_QUERY_KEY });

  const createMutation = useMutation({
    mutationFn: (input: MatchInput) => createMatch(token as string, input),
    onSuccess: () => {
      invalidate();
      setFormState("closed");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: MatchInput & { id: string }) => updateMatch(token as string, input),
    onSuccess: () => {
      invalidate();
      setFormState("closed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteMatch(token as string, id),
    onSuccess: invalidate,
  });

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 pb-16">
        <AppHeader tournament={data?.tournament ?? {}} />
        <NavTabs />
        <PasswordGate onLogin={login} />
      </div>
    );
  }

  const matches = data?.matches ?? [];
  const teams = data?.teams ?? [];

  function hasScheduleConflict(input: MatchInput): boolean {
    return matches.some(
      (match) =>
        match.id !== input.id &&
        match.date === input.date &&
        match.period === input.period &&
        (match.a === input.a || match.b === input.a || match.a === input.b || match.b === input.b),
    );
  }

  async function handleSubmit(input: MatchInput) {
    if (hasScheduleConflict(input)) {
      const proceed = window.confirm("같은 날짜·교시에 이미 관련된 경기가 있습니다. 계속 저장할까요?");
      if (!proceed) return;
    }
    if (input.id) {
      await updateMutation.mutateAsync(input as MatchInput & { id: string });
    } else {
      await createMutation.mutateAsync(input);
    }
  }

  function handleDelete(match: Match) {
    if (!window.confirm(`${match.a} vs ${match.b} 경기를 삭제할까요?`)) return;
    deleteMutation.mutate(match.id);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16">
      <AppHeader tournament={data?.tournament ?? {}} />
      <NavTabs />

      <div className="mb-4 flex items-center justify-between">
        <Button variant="secondary" onClick={logout}>
          로그아웃
        </Button>
        <Button onClick={() => setFormState("create")}>경기 추가</Button>
      </div>

      {formState !== "closed" ? (
        <div className="mb-6">
          <MatchForm
            teams={teams}
            initial={formState === "create" ? null : formState}
            onSubmit={handleSubmit}
            onCancel={() => setFormState("closed")}
          />
        </div>
      ) : null}

      {isLoading ? (
        <p className="py-12 text-center text-slate-400">불러오는 중...</p>
      ) : (
        <AdminMatchList
          matches={matches}
          onEdit={(match) => setFormState(match)}
          onDelete={handleDelete}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
