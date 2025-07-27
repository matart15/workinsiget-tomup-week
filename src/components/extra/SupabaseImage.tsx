import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

export const SupabaseImage = ({
  supabase,
  bucketName,
  path,
  className,
  isPublic,
  fallbackImage,
}: {
  supabase: any;
  bucketName: string;
  path?: string | null;
  className?: string;
  isPublic?: true;
  fallbackImage: string;
}) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  useEffect(() => {
    const getSignedUrl = async () => {
      if (!path) {
        setSignedUrl(fallbackImage);
        return;
      }
      if (isPublic) {
        const { data } = supabase.storage.from(bucketName).getPublicUrl(path);
        setSignedUrl(data.publicUrl);
        return;
      }
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(path, 60);
      if (error) {
        throw error;
      }
      setSignedUrl(data.signedUrl);
    };
    getSignedUrl().catch(() => {});
  }, [bucketName, fallbackImage, isPublic, path, supabase]);
  return (
    <img
      className={cn(['w-full', className])}
      alt="img"
      src={signedUrl ?? fallbackImage}
      onError={(e) => {
        e.currentTarget.onerror = null; // Prevents infinite loop in case LogoImage fails too
        e.currentTarget.src = fallbackImage;
      }}
    />
  );
};
