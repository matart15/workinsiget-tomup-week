import type React from 'react';

import { Button } from '@/components/ui/button';
import type { ModalPath } from '@/router';
import { Link } from '@/router';
import { useIsDevMode } from '@/services/useIsDevMode';

const modalPath: ModalPath = '/dev/u_page/by_path/pageProps';
export function withPageDevTool<T extends object>(
  Page: React.ComponentType<T>,
  filePath: string,
): React.FC<T> {
  return (props: T) => {
    // TODO: need to check user permission
    const isDevMode = useIsDevMode({
      devString: 'true',
    });
    if (isDevMode) {
      return <Page {...props} />;
    }

    return (
      <div
        style={{
          position: 'relative',
          padding: '1px',
        }}
      >
        <Button
          type="button"
          variant="ghost"
          // onClick={handleClick}
          className="m-0 size-4 p-0"
          style={{
            position: 'absolute',
            top: '8px',
            right: '4px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '6px',
          }}
          title="Open Dev Tool"
        >
          <Link
            to={location.href as any}
            state={{ modal: modalPath }}
            className="text-blue-600 underline"
          >
            🔗
          </Link>
        </Button>
        <Page {...props} />
      </div>
    );
  };
}

/**
 * if we add ?devMode=true to the url, it will return the page data as json blob.
 */
// import { useAllSearchParams } from '@/lib/useAllSearchParams';
// import { useIsDevMode } from '@/services/useIsDevMode';
// import type React from 'react';

// type DevToolMeta = {
//   componentName: string;
//   props: Record<string, string>;
//   usedComponents: Array<{ name: string; props: Record<string, string> }>;
// };

// type WithPageDevToolProps<T> = T & { __devMode?: boolean };

// export function withPageDevTool<T extends object>(
//   Page: React.ComponentType<T>,
//   filePath: string,
// ): React.FC<WithPageDevToolProps<T>> {
//   const WithDevTool: React.FC<WithPageDevToolProps<T>> = (props) => {
//     const searchParams = useAllSearchParams();
//     const devMode = useIsDevMode({
//       devString: 'true',
//     });
//     console.log('🚀 ~ devMode:', searchParams.params.devMode, devMode);

//     const filePathWithoutQuery = filePath.replace(/\?.*$/, '');
//     const meta = (window as any).__DEVTOOL_META__?.[filePathWithoutQuery];
//     console.log(
//       '🚀 ~ Current Page Meta:',
//       (window as any).__DEVTOOL_META__,
//       filePathWithoutQuery,
//       meta,
//     );

//     if (devMode && meta) {
//       // ✅ Return raw JSON response
//       return (
//         <>
//           {typeof window !== 'undefined' &&
//             (() => {
//               const jsonString = JSON.stringify(meta, null, 2);
//               const blob = new Blob([jsonString], { type: 'application/json' });
//               const url = URL.createObjectURL(blob);
//               window.location.href = url;
//             })()}
//         </>
//       );
//       return <pre>{JSON.stringify(meta, null, 2)}</pre>;
//     }

//     return <Page {...(props as T)} />;
//   };

//   WithDevTool.displayName = `WithPageDevTool(${Page.displayName || Page.name || 'Component'})`;

//   // ✅ Attach the meta after Vite injects it
//   const filePathWithoutQuery = filePath.replace(/\?.*$/, '');
//   (WithDevTool as any).__DEVTOOL_META__ = (window as any).__DEVTOOL_META__?.[
//     filePathWithoutQuery
//   ];

//   // Ensure `__DEVTOOL_META__` is accessible on the wrapped component
//   // (WithDevTool as any).__DEVTOOL_META__ = (Page as any).__DEVTOOL_META__;

//   return WithDevTool;
// }
