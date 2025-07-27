import { useAuth } from '@matart15/lib_authentication_supabase';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AlertTriangle } from 'lucide-react';
import type { ReactElement } from 'react';
import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Toaster } from '@/components/ui/sonner';
import { supabase } from '@/lib/supabase';
import { useGetRole } from '@/lib/useGetRole';
import type { Path } from '@/router';
import { Navigate } from '@/router';

const PUBLIC_PATHS: Path[] = [
  '/login',
];

const ROLE_HOME: Record<string, string> = {
  admin: '/admin',
  manager: '/manager',
  staff: '/staff',
};

const queryClient = new QueryClient();

const NoPermission = () => {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-sm mx-auto shadow-lg flex flex-col">
        <CardHeader className="flex flex-col items-center gap-2 p-4">
          <Alert variant="destructive" className="w-full flex items-center gap-3">
            <AlertTriangle className="size-6 text-destructive" />
            <div>
              <AlertTitle className="text-lg">No Permission</AlertTitle>
              <AlertDescription>You do not have access to view this page.</AlertDescription>
            </div>
          </Alert>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 mt-2 p-4">
          <Button
            variant="destructive"
            className="w-full text-base py-3"
            onClick={() => signOut({ supabase: supabase as any })}
          >
            Logout
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

const Redirects = ({ children }: { children: ReactElement }) => {
  const { user } = useAuth();
  const role = useGetRole();
  const location = useLocation();
  const { pathname } = location;
  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0];

  if (!firstSegment) {
    return <div>Not found</div>;
  }
  // Not logged in
  if (!user) {
    if (PUBLIC_PATHS.includes(pathname as Path)) {
      return children;
    }
    return <Navigate to="/login" replace />;
  }

  // Role-based access
  // if (firstSegment in ROLE_HOME && role !== firstSegment) {
  //   return <NoPermission />;
  // }

  // After login: redirect to role home
  if (pathname === '/login' || pathname === '/') {
    if (role && ROLE_HOME[role]) {
      return <Navigate to={ROLE_HOME[role] as any} replace />;
    }
    // fallback: not found or loading
    return <div>Not found</div>;
  }

  return <Outlet />;
};

export const Catch = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="rounded p-4 bg-red-100">
      <div className="text-lg font-bold mb-2">Something went wrong</div>
      Please try again later.
    </div>
  </div>
);

const AuthRoute = () => (
  <section>
    <main className="flex min-h-screen flex-col items-center">
      <QueryClientProvider client={queryClient}>
        <Redirects>
          <>
            <Outlet />
            <Toaster />
          </>
        </Redirects>
      </QueryClientProvider>
    </main>
  </section>
);

export default AuthRoute;
