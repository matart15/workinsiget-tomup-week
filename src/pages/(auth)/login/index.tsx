import { useAuth } from '@matart15/lib_authentication_supabase';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { SpecForm } from '@/components/SpecComponents/SpecForm';
import { SpecInput } from '@/components/SpecComponents/SpecInput';
import { SpecPassword } from '@/components/SpecComponents/SpecPassword';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

type LoginForm = {
  email: string;
  password: string;
};

export default function UserLoginPage() {
  const { login } = useAuth();
  const form = useForm<LoginForm>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    setLoading(true);
    try {
      await login({
        email: data.email,
        password: data.password,
        supabase: supabase as any,
      });
    } catch (e: any) {
      setError(e?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn('flex flex-col gap-6 min-h-screen items-center justify-center bg-gray-50 px-4')}>
      <Card className="w-full max-w-md mx-auto shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <SpecForm form={form} onSubmit={onSubmit} buttonProps={{ text: loading ? 'Logging in...' : 'Login', disabled: loading }}>
              <SpecInput
                formProps={{
                  form,
                  fieldName: 'email',
                  label: 'Email',
                  isRequired: true,
                }}
                type="email"
                autoComplete="email"
                disabled={loading}
              />
              <SpecPassword
                formProps={{
                  form,
                  fieldName: 'password',
                  label: 'Password',
                  isRequired: true,
                }}
                autoComplete="current-password"
                disabled={loading}
              />
              {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
            </SpecForm>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
