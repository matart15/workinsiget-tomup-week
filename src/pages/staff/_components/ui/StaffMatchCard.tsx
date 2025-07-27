import { useNavigate } from 'react-router-dom';
import type { z } from 'zod';

import { SupabaseImage } from '@/components/extra/SupabaseImage';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import type { sMatchesRowSchema } from '@/db/types/schema';
import { USER_AVATAR_BUCKET_NAME } from '@/lib/const';
import { supabase } from '@/lib/supabase';

type SMatch = z.infer<typeof sMatchesRowSchema>;

export function StaffMatchCard({ match, user, matchId, matchIdLoading }: { match: SMatch; user?: any; matchId?: string; matchIdLoading?: boolean }) {
  const navigate = useNavigate();
  return (
    <Card
      key={match.id}
      className="flex flex-col md:flex-row items-center gap-4 p-4 shadow-lg border border-muted-foreground/10 cursor-pointer"
      onClick={() => navigate(`/staff/match/${match.id}`)}
    >
      <div className="flex flex-col items-center min-w-[110px]">
        <SupabaseImage
          path={user?.avatar_url}
          fallbackImage="/vite.svg"
          supabase={supabase}
          bucketName={USER_AVATAR_BUCKET_NAME}
          className="rounded-full w-20 h-20 object-cover border border-muted-foreground/20 shadow"
          isPublic
        />
        <div className="mt-2 text-center text-base font-semibold">
          {user ? (user.firstname || user.lastname ? `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim() : '—') : 'Loading...'}
        </div>
        <div className="text-xs text-muted-foreground text-center break-all">{user?.email ?? '—'}</div>
      </div>
      <div className="flex-1 w-full">
        <CardHeader className="p-0 pb-2">

          <CardDescription>
            作成日:
            {' '}
            {new Date(match.created_at).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 pt-2">
          <div className="flex flex-col gap-2 text-sm">

            <div>
              <span className="font-medium">スタッフ最終閲覧:</span>
              {' '}
              {match.staff_last_seen_at ? new Date(match.staff_last_seen_at).toLocaleString() : '未閲覧'}
            </div>
            <div>
              <span className="font-medium">ユーザー最終閲覧:</span>
              {' '}
              {match.user_last_seen_at ? new Date(match.user_last_seen_at).toLocaleString() : '未閲覧'}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
