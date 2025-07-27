import type { DropzoneOptions, FileWithPath } from 'react-dropzone';
import { useDropzone } from 'react-dropzone';

export type { FileWithPath };
const byteToHumanReadableString = (bytes: number) => {
  if (bytes <= 0) {
    return '0 Byte';
  }
  if (bytes < 1024) {
    return `${bytes} Bytes`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
  return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
};

export const Dropzone = ({
  fileTypeMessage,
  dropZoneOptions,
}: {
  dropZoneOptions: DropzoneOptions;
  fileTypeMessage?: string;
}) => {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/jpg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    ...dropZoneOptions,
  });

  const files = acceptedFiles.map((file: FileWithPath) => (
    <li key={file.path}>
      {file.path}
      {' '}
      -
      {byteToHumanReadableString(file.size)}
    </li>
  ));

  return (
    <section>
      <div
        {...getRootProps({
          className: 'dropzone flex w-full items-center justify-center rounded',
        })}
      >
        <div className="flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 ">
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center pb-6 pt-5">
            <svg
              className="mb-3 h-10 w-10 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mb-2 text-sm text-gray-500 ">
              <span className="font-semibold">Click to upload</span>
              {' '}
              or drag and
              drop
            </p>
            <p className="text-xs text-gray-500 ">
              {fileTypeMessage ?? 'PNG, JPG (MAX. 800x400px)'}
            </p>
          </div>
          <input id="dropzone-file" type="file" className="hidden" />
        </div>
      </div>
      <aside>
        <h4>Files</h4>
        <ul>{files}</ul>
      </aside>
    </section>
  );
};
