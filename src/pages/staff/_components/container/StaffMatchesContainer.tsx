import { useAuth } from '@matart15/lib_authentication_supabase';

import { useStaffMatches } from '@/hooks/db/staff/queries/useStaffMatches';

import { StaffMatchList } from '../ui/StaffMatchList';

export default function StaffMatchesContainer() {
  const { user } = useAuth();
  const { data: matches, isLoading: matchesLoading } = useStaffMatches(user?.id);

  if (matchesLoading) {
    return <div className="text-center text-muted-foreground py-8">読み込み中...</div>;
  }
  if (!matches || matches.length === 0) {
    return <div className="text-center text-muted-foreground py-8">マッチがありません</div>;
  }

  // Build users and matchIds maps
  const users: Record<string, any> = {};
  matches.forEach((m) => {
    users[m.user_id] = m.user;
  });
  // matchIds logic unchanged
  const matchIds: Record<string, { matchId?: string; isLoading?: boolean }> = {};
  matches.forEach((m, i) => {
    matchIds[m.id] = { matchId: undefined, isLoading: false };
  });

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-2xl font-bold mb-2">マッチ一覧</h1>
      <StaffMatchList matches={matches} users={users} matchIds={matchIds} />
    </div>
  );
}
