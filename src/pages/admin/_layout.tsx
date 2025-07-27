import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

function prettify(segment: string, i: number, segments: string[]) {
  // If last segment and looks like a UUID or number, show "Detail"
  if (
    i === segments.length - 1
    && (segment.match(/^[0-9a-f-]{8,}$/i) || segment.match(/^\\d+$/))
  ) {
    return 'Detail';
  }
  if (segment.startsWith('[') && segment.endsWith(']')) {
    return segment;
  }
  return segment.replace(/[-_]/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase());
}

function autoBreadcrumb(pathname: string) {
  const segments = pathname.split('/').filter(Boolean);
  let href = '';
  return segments.map((seg: string, i: number) => {
    href += `/${seg}`;
    return {
      label: prettify(seg, i, segments),
      href,
    };
  });
}

// Map pathname to file path in src/pages
function routeToFilePath(pathname: string) {
  // Only works for (admin) for now
  let segments = pathname.split('/').filter(Boolean);
  if (segments[0] !== 'admin') {
    return null;
  }
  segments = segments.slice(1);
  let filePath = 'src/pages/(admin)';
  for (const seg of segments) {
    if (seg.match(/^\d+$/) || seg.match(/^[\w-]+$/)) {
      // Could be dynamic, but we only support [id] for now
      if (seg.match(/^\d+$/)) {
        filePath += '/[id]';
      } else {
        filePath += `/${seg}`;
      }
    } else {
      filePath += `/${seg}`;
    }
  }
  // Try index.tsx first
  return `${filePath}/index.tsx`;
}

function useHybridBreadcrumb() {
  const { pathname } = useLocation();
  const [breadcrumb, setBreadcrumb] = useState<{ label: string; href: string }[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const filePath = routeToFilePath(pathname);
    if (!filePath) {
      setBreadcrumb(autoBreadcrumb(pathname));
      return;
    }
    import(/* @vite-ignore */ `../../../${filePath}`)
      .then((mod) => {
        if (cancelled) {
          return;
        }
        if (mod.breadcrumb) {
          setBreadcrumb(
            typeof mod.breadcrumb === 'function'
              ? mod.breadcrumb({ pathname })
              : mod.breadcrumb,
          );
        } else {
          setBreadcrumb(autoBreadcrumb(pathname));
        }
      })
      .catch(() => setBreadcrumb(autoBreadcrumb(pathname)));
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return breadcrumb || autoBreadcrumb(pathname);
}

export default function AdminLayout() {
  console.log('🚀 ~ AuthRoute:');
  const breadcrumb = useHybridBreadcrumb();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b">
          <div className="flex items-center gap-2 px-3">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumb.map((item: { label: string; href: string }, i: number) => (
                  <React.Fragment key={item.href}>
                    <BreadcrumbItem className="hidden md:block">
                      {i < breadcrumb.length - 1
                        ? (
                            <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                          )
                        : (
                            <BreadcrumbPage>{item.label}</BreadcrumbPage>
                          )}
                    </BreadcrumbItem>
                    {i < breadcrumb.length - 1 && <BreadcrumbSeparator className="hidden md:block" />}
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};
