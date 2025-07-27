/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Button } from '../ui/button';

export const SupabaseDownloadLink = ({
  supabase,
  bucketName,
  path,
  className,
  downloadFileName,
  text,
}: {
  supabase: any;
  bucketName: string;
  path: string;
  downloadFileName: string;
  className?: string;
  text?: string;
}) => {
  const downloadDocument = async () => {
    const result = await supabase.storage.from(bucketName).download(path);
    const { data, error } = result;
    if (error) {
      console.error('Error downloading image:', error);
    } else if (data) {
      const link = document.createElement('a');
      // create a blobURI pointing to our Blob
      link.href = URL.createObjectURL(data); // eslint-disable-line @typescript-eslint/no-unsafe-argument
      link.download = downloadFileName; // path;
      // some browser needs the anchor to be in the doc
      document.body.append(link);
      link.click();
      link.remove();
      // in case the Blob uses a lot of memory
      setTimeout(() => {
        URL.revokeObjectURL(link.href);
      }, 7000);
    } else {
      console.error('No data or error returned');
    }
  };
  return (
    <Button
      type="button"
      variant="link"
      className={className}
      onClick={() => downloadDocument()}
    >
      {text}
    </Button>
  );
};
