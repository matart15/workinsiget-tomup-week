import { useAuth } from '@matart15/lib_authentication_supabase';
import { Menu as MenuIcon } from 'lucide-react';
import React from 'react';
import { Outlet } from 'react-router';

import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { supabase } from '@/lib/supabase';

export default function StaffLayout() {
  const { signOut } = useAuth();
  const handleLogout = React.useCallback(() => {
    if (window.confirm('本当にログアウトしますか？')) {
      console.log('🚀 ~ signOut:', signOut, supabase);
      signOut({
        supabase: supabase as any,
      });
    }
  }, [signOut]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted">
      <Drawer direction="left">
        <div className="w-full max-w-md mx-auto bg-background shadow-lg min-h-screen flex flex-col">
          {/* Hamburger button inside main part */}
          <div className="p-2 flex items-center">
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon">
                <MenuIcon />
                <span className="sr-only">メニュー</span>
              </Button>
            </DrawerTrigger>
          </div>
          <Outlet />
        </div>
        <DrawerContent className="w-64 min-h-screen p-0 flex flex-col">
          <DrawerHeader>
            <DrawerTitle>スタッフ</DrawerTitle>
          </DrawerHeader>
          <nav className="flex flex-col gap-2 px-4 flex-1">
            <a href="/staff" className="py-2 px-3 rounded hover:bg-accent transition-colors">マッチ一覧</a>
          </nav>
          <div className="flex flex-col gap-2 px-4 pb-4 mt-auto">
            <Button asChild variant="outline">
              <a href="/me">プロフィール</a>
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              ログアウト
            </Button>
          </div>
          <DrawerClose asChild>
            <Button variant="ghost" className="absolute top-4 right-4">閉じる</Button>
          </DrawerClose>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
