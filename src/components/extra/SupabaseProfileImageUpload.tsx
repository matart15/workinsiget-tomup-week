import type { SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';

import type { Database } from '@/__generated__/database';
import PenSvg from '@/assets/Lv1_pen.svg';
import EmptyProfile from '@/assets/profile-icon.svg';
import { Label } from '@/components/ui/label';
import { useMyProfile } from '@/hooks/db/queries/useMyProfile';
import { cn } from '@/lib/utils';

import { Button } from '../ui/button';
import type { FileWithPath } from './Dropzone';
import { SupabaseImage } from './SupabaseImage';

export const SupabaseProfileImageUpload = ({
  supabase,
  bucketName,
  displayImagePath,
  className,
  isPublic,
  uploadOrDeleteProfileImage,
  isRequired,
}: {
  supabase: SupabaseClient<Database, 'public'>;
  bucketName: keyof Database['public']['Tables'];
  displayImagePath?: string | null;
  className?: string;
  isPublic?: true;
  uploadOrDeleteProfileImage: (
    file: FileWithPath | null,
  ) => Promise<{ data: boolean; error: null } | { data: null; error: Error }>;
  isRequired?: boolean;
}) => {
  const [_signedUrl, setSignedUrl] = useState<string | null>(null);
  const profile = useMyProfile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSelectFiles = (acceptedFiles: FileWithPath[]) => {
    const file = acceptedFiles[0];
    if (!file) {
      return;
    }
    void uploadOrDeleteProfileImage(file);
  };

  useEffect(() => {
    if (!displayImagePath) {
      return;
    }
    const getSignedUrl = async () => {
      if (isPublic) {
        const { data } = supabase.storage
          .from(bucketName)
          .getPublicUrl(displayImagePath);
        setSignedUrl(data.publicUrl);
        return;
      }
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(displayImagePath, 60);
      if (error) {
        throw error;
      }
      setSignedUrl(data.signedUrl);
    };
    getSignedUrl().catch(() => {});
  }, [bucketName, isPublic, displayImagePath, supabase]);
  const size = 100;

  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center gap-2">
        <div className="text-sm font-normal leading-4 text-gray-600">
          プロフィール画像
          {isRequired && (
            <Label className="ml-2 text-[12px] font-normal leading-4 text-red-600">
              必須
            </Label>
          )}
        </div>
      </div>
      <div className="relative">
        <div className="h-[100px] w-[100px] overflow-hidden rounded-full border-[1px] border-gray-400">
          <SupabaseImage
            className="h-full w-full rounded-full object-cover"
            supabase={supabase}
            bucketName={bucketName}
            path={profile?.avatar_url}
            fallbackImage={EmptyProfile}
          />
        </div>
        {profile?.avatar_url ? (
          <div className="absolute right-0 top-0 flex h-8 w-8 justify-center rounded-full border-primary bg-primary/80 p-0">
            <DeleteConfirmation
              onOk={async () => {
                const result = await uploadOrDeleteProfileImage(null);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-explicit-any
                return result as any;
              }}
              buttonClassName="text-white"
            />
          </div>
        ) : (
          <>
            {/* Hidden input for file upload */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg, .jpeg, .png, .gif"
              style={{ display: 'none' }}
              onChange={(e) => {
                const files = (e.target as HTMLInputElement).files;
                if (files) {
                  onSelectFiles(Array.from(files));
                }
              }}
            />

            <Button
              variant="link"
              type="button"
              className={cn([
                // `h-[${size}px] w-[${size}px]`,
                'p-0',
                className,
                // "relative ",
                'absolute bottom-0 right-0 z-10 cursor-pointer',
              ])}
              style={{
                height: size,
                width: size,
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="absolute bottom-0 right-0 z-10 cursor-pointer">
                <img
                  className="h-6 w-6 rounded-full border-[1px] border-gray-600 bg-white"
                  src={PenSvg}
                  alt=""
                />
              </div>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
