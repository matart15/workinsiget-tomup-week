import { useAuth } from '@matart15/lib_authentication_supabase';
import { ChevronRight, GalleryVerticalEnd } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { supabase } from '@/lib/supabase';

// This is sample data.
const data = [
  {
    title: 'App',
    url: '/admin/app',
    items: [
      { title: 'Plan', url: '/admin/app/plan' },
    ],
  },
  {
    title: 'Concierge',
    url: '/admin/concierge',
    items: [
      { title: 'Category', url: '/admin/concierge/category' },
      { title: 'List', url: '/admin/concierge' },
    ],
  },
  {
    title: 'Users',
    url: '/admin/users',
    items: [
      { title: 'Managers', url: '/admin/users?type=managers' },
      { title: 'Staffs', url: '/admin/users?type=staffs' },
      { title: 'AppUsers', url: '/admin/users?type=app-users' },
    ],
  },
  {
    title: 'Match',
    url: '/admin/match',
    items: [
      { title: 'List', url: '/admin/match/list' },
    ],
  },
  {
    title: 'Event',
    url: '/admin/event',
    items: [
      { title: 'List', url: '/admin/event/list' },
    ],
  },
  {
    title: 'Community',
    url: '/admin/community',
    items: [
      { title: 'List', url: '/admin/community/list' },
    ],
  },
];

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation();
  const { signOut } = useAuth();
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">Documentation</span>
                  <span className="">v1.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex h-full flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">
            <SidebarGroup>
              <SidebarGroupLabel>Main</SidebarGroupLabel>
              <SidebarMenu>
                {data.map((item) => {
                  // Find if current path matches this main section or any of its children
                  const isActive
                    = pathname === item.url
                      || (item.items && item.items.some(sub => pathname.startsWith(sub.url)));
                  return (
                    <Collapsible
                      key={item.title}
                      asChild
                      defaultOpen={isActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.title}
                            className={isActive ? 'bg-sidebar-accent text-foreground font-semibold' : ''}
                          >
                            <span>{item.title}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          {item.items && item.items.length > 0 && (
                            <SidebarMenuSub>
                              {item.items.map(subItem => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton asChild>
                                    <a
                                      href={subItem.url}
                                      className={pathname === subItem.url ? 'bg-sidebar-accent text-foreground font-medium' : ''}
                                    >
                                      <span>{subItem.title}</span>
                                    </a>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          )}
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </div>
          {/* Settings section at the bottom, always visible */}
          <div className="border-t border-sidebar-border bg-sidebar-background sticky bottom-0 z-10 px-4 py-3">
            <div className="text-xs font-semibold text-sidebar-foreground mb-2">Settings</div>
            <div className="flex flex-col gap-1">
              <a
                href="/settings/profile"
                className="font-medium text-sm px-2 py-1 rounded hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
              >
                Profile
              </a>
              <button
                type="button"
                className="font-medium text-sm px-2 py-1 rounded hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors text-left"
                onClick={() => {
                  if (window.confirm('Logout?')) {
                    signOut({ supabase: supabase as any });
                  }
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
