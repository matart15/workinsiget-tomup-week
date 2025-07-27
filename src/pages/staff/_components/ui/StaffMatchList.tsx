import type { z } from 'zod';

import type { sMatchesRowSchema } from '@/db/types/schema';

import { StaffMatchCard } from './StaffMatchCard';

type SMatch = z.infer<typeof sMatchesRowSchema>;

export function StaffMatchList({ matches, users, matchIds }: { matches: SMatch[]; users: Record<string, any>; matchIds: Record<string, { matchId?: string; isLoading?: boolean }> }) {
  return (
    <div className="flex flex-col gap-4">
      {matches.map(m => (
        <StaffMatchCard
          key={m.id}
          match={m}
          user={users[m.user_id]}
          matchId={matchIds[m.id]?.matchId}
          matchIdLoading={matchIds[m.id]?.isLoading}
        />
      ))}
    </div>
  );
}
