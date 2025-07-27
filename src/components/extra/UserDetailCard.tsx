import LogoImage from '@/assets/react.svg';
import { SupabaseImage } from '@/components/extra/SupabaseImage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { USER_AVATAR_BUCKET_NAME } from '@/lib/const';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

export function UserDetailCard({ user, className }: { user: any; className?: string }) {
  const { isCopied: isIdCopied, copyToClipboard: copyId } = useCopyToClipboard({});
  const { isCopied: isEmailCopied, copyToClipboard: copyEmail } = useCopyToClipboard({});
  const isLineConnected = !!user.line_data?.userProfile;
  const fullName = `${user.firstname ?? ''} ${user.lastname ?? ''}`.trim();

  return (
    <Card className={cn('mx-auto', className)}>
      <CardHeader className="flex flex-col items-center gap-2 border-b pb-4">
        <SupabaseImage
          path={user.avatar_url}
          fallbackImage={LogoImage}
          supabase={supabase}
          bucketName={USER_AVATAR_BUCKET_NAME}
          className="rounded-full w-24 h-24 object-cover border"
          isPublic
        />
        <CardTitle className="mt-2 text-xl text-center">{fullName || '—'}</CardTitle>
        <CardDescription className="flex items-center gap-2 justify-center">
          {user.email ?? '—'}
          {user.email && (
            <Button
              size="sm"
              variant="outline"
              className="px-2 py-0.5 text-xs"
              onClick={() => copyEmail(user.email)}
            >
              {isEmailCopied ? 'Copied!' : 'Copy'}
            </Button>
          )}
        </CardDescription>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-muted-foreground">{user.company_name ?? '—'}</span>
          <Badge
            className={isLineConnected ? 'bg-[#06C755] text-white' : 'bg-gray-200 text-gray-700 border-gray-300'}
            variant={isLineConnected ? undefined : 'outline'}
          >
            LINE
            {' '}
            {isLineConnected ? 'Connected' : 'Not Connected'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 mt-4">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{user.id}</span>
          <Button
            size="sm"
            variant="outline"
            className="px-2 py-0.5 text-xs"
            onClick={() => copyId(user.id)}
          >
            {isIdCopied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
