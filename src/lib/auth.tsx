import type { AuthResponse, User } from '@supabase/supabase-js';
import { AuthError } from '@supabase/supabase-js';
import type { FunctionComponent, ReactNode } from 'react';
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type * as z from 'zod';

import type { usersRowSchema } from '@/__generated__/schema';
import { debugLog, sendErrorMessage } from '@/lib/logger';

import { supabase } from './supabase';

type EmailPassword = {
  email: string;
  password: string;
};

// const checkUserProfileIsCreated = async (user: User | null) => {
//   if (user) {
//     const { error, data } = await supabase
//       .from("users")
//       .select("id")
//       .eq("id", user.id)
//       .single();
//     if (!error && data) {
//       return true;
//     }
//   }
//   return false;
// };

type AuthContextType = {
  signIn: (a: EmailPassword) => Promise<void>;
  // signInApple: () => Promise<
  //   | {
  //       data: {
  //         user: User;
  //         isProfileCreated: boolean;
  //       };
  //       error?: undefined;
  //     }
  //   | {
  //       error: any;
  //       data?: undefined;
  //     }
  //   | undefined
  // >;
  tryOtp: (a: { email: string; token: string }) => Promise<AuthResponse>;
  signUp: (a: EmailPassword) => Promise<void>;
  signOut: () => void;
  reloadUser: () => Promise<void>;
  user: UserWithProfile | null;
  temporarySetProfile: (user: User | null) => void;
};

const AuthContext = createContext<AuthContextType>({
  reloadUser: async () => {},
  signIn: async () => {},
  // signInApple: async () => ({ error: new Error("NO_IMPLEMENTATION") }),
  signOut: () => {},
  signUp: async () => {},
  temporarySetProfile: () => {},
  tryOtp: async () => ({
    data: { session: null, user: null },
    error: new AuthError('NO_IMPLEMENTATION'),
  }),
  user: null,
});

// This hook can be used to access the user info.
export const useAuth = (): AuthContextType => use(AuthContext);

// This hook will protect the route access based on user authentication.
// const useProtectedRoute = (user: any): void => {
//   // const segments = useSegments();
//   // const router = useRouter();
//   const navaitaion  = useNavigation()

//   React.useEffect(() => {
//     const inAuthGroup = segments[0] === '(auth)';
//     if (
//       // If the user is not signed in and the initial segment is not anything in the auth group.
//       !user &&
//       !inAuthGroup
//     ) {
//       // Redirect to the sign-in page.
//       router.replace('/sign-in');
//     } else if (user && inAuthGroup) {
//       // Redirect away from the sign-in page.
//       router.replace('/top');
//     }
//   }, [user, segments, router]);
// };

export type UserWithProfile = User & {
  profile: z.infer<typeof usersRowSchema> | null;
};
const addProfileDataToSupabaseUser = async ({
  supabaseUser,
  setUser,
}: {
  supabaseUser: UserWithProfile;
  setUser: (a: UserWithProfile | null) => void;
}): Promise<void> => {
  if (supabaseUser.id) {
    try {
      const res = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      if (!res.error) {
        setUser({
          ...supabaseUser,
          profile: res.data,
        });
      }
      if (res.error?.code === 'PGRST116') {
        // no result
        setUser({
          ...supabaseUser,
          profile: null,
        });
      }
    } catch (error: unknown) {
      sendErrorMessage(error);
    }
  }
};

export const AuthProvider: FunctionComponent<{ children: ReactNode }> = ({
  children,
}) => {
  const [user1, setUser] = useState<UserWithProfile | null>(null);
  const [loading, setLoading] = useState(false);
  debugLog('AuthProvider', loading);

  useEffect(() => {
    const initAuth = async () => {
      try {
        debugLog('🟡 Auth init starting');

        const sessionRes = await supabase.auth.getSession();
        debugLog('✅ sessionRes:', sessionRes);

        if (!sessionRes.data.session) {
          debugLog('🚫 No session');
          setUser(null);
          return;
        }

        debugLog('✅ getUser:');
        const userRes = await supabase.auth.getUser();
        debugLog('✅ userRes:', JSON.stringify(userRes, null, 2));

        if (!userRes.data.user) {
          debugLog('🚫 No user found');
          setUser(null);
          return;
        }

        await addProfileDataToSupabaseUser({
          setUser,
          supabaseUser: {
            profile: null,
            ...userRes.data.user,
          },
        });

        debugLog('✅ User restored');
      } catch (error: unknown) {
        debugLog('❌ initAuth error:', error);
        sendErrorMessage('initAuth', error);
      }
    };
    initAuth();
  }, []);

  const signInWithEmail = useCallback(
    async ({ email, password }: EmailPassword): Promise<void> => {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      // const result = await supabase.auth.signInWithOtp({
      //   email,
      // });
      if (error) {
        throw error;
      }
      addProfileDataToSupabaseUser({
        setUser,
        supabaseUser: {
          profile: null,
          ...data.user,
        },
      }).catch((error1: unknown) => {
        sendErrorMessage('addProfileDataToSupabaseUser1', error1);
      });
      setLoading(false);
    },
    [],
  );

  const signUpWithEmail = useCallback(
    async ({ email, password }: EmailPassword): Promise<void> => {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      // const { error } = await supabase.auth.signInWithOtp({
      //   email,
      //   options: {
      //     emailRedirectTo: "https://example.com",
      //   },
      // });

      if (error) {
        throw error;
      }

      setLoading(false);
    },
    [],
  );

  const tryOtp = useCallback(
    async ({
      token,
      email,
    }: {
      email: string;
      token: string;
    }): Promise<AuthResponse> => {
      try {
        let result = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'signup',
        });
        if (result.error?.status === 401) {
          result = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'magiclink',
          });
        }
        const { data, error } = result;
        if (!error && data.user) {
          addProfileDataToSupabaseUser({
            setUser,
            supabaseUser: {
              profile: null,
              ...data.user,
            },
          }).catch((error1: unknown) => {
            sendErrorMessage('addProfileDataToSupabaseUser', error1);
          });
        }
        return result;
      } catch (error: unknown) {
        if (error instanceof AuthError) {
          return {
            data: {
              session: null,
              user: null,
            },
            error,
          };
        }
        sendErrorMessage({ error });
        return {
          data: {
            session: null,
            user: null,
          },
          error: new AuthError('NO_IMPLEMENTATION'),
        };
      }
    },
    [],
  );

  const signOut = useCallback((): void => {
    setLoading(true);
    supabase.auth.signOut().catch(() => {
      sendErrorMessage('ログアウトに失敗しました');
    });
    setUser(null);
    setLoading(false);
  }, []);
  const reloadUser = useCallback(async () => {
    const authResponse = await supabase.auth.refreshSession();
    if (authResponse.data.user) {
      await addProfileDataToSupabaseUser({
        setUser,
        supabaseUser: {
          profile: null,
          ...authResponse.data.user,
        },
      });
      // setUser({
      //   ...authResponse.data.user,
      //   profile: user1?.profile ?? null,
      // });
    }
  }, [user1?.profile]);

  // const signInApple = async () => {
  //   try {
  //     const credential = await AppleAuthentication.signInAsync({
  //       requestedScopes: [
  //         AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
  //         AppleAuthentication.AppleAuthenticationScope.EMAIL,
  //       ],
  //     });

  //     // on success
  //     const token = credential.identityToken ?? "";

  //     const result = await supabase.auth.signInWithIdToken({
  //       provider: "apple",
  //       token,
  //       // nonce: rawNonce,
  //     });
  //     const { data, error } = result;
  //     if (error) return { error };
  //     if (!data.user) {
  //       return { error: new Error("ユーザーが見つかりません") };
  //     }
  //     const isProfileCreated = await checkUserProfileIsCreated(data.user);
  //     if (isProfileCreated) {
  //       addProfileDataToSupabaseUser({
  //         setUser,
  //         supabaseUser: {
  //           profile: null,
  //           ...data.user,
  //         },
  //       }).catch((error1) => {
  //         sendErrorMessage("addProfileDataToSupabaseUser", error1);
  //       });
  //     }
  //     return {
  //       data: {
  //         isProfileCreated,
  //         user: data.user,
  //       },
  //     };
  //   } catch (error: unknown) {
  //     sendErrorMessage(error);
  //     return { error };
  //   }
  // };

  const temporarySetProfile = useCallback((user: User | null) => {
    if (!user) {
      debugLog('no user');
      setUser(null);
      return;
    }
    debugLog('set user ', {
      setUser,
      supabaseUser: {
        profile: null,
        ...user,
      },
    });
    addProfileDataToSupabaseUser({
      setUser,
      supabaseUser: {
        profile: null,
        ...user,
      },
    }).catch((error: unknown) => {
      sendErrorMessage('addProfileDataToSupabaseUser', error);
    });
  }, []);
  const authContextValue = useMemo(
    () => ({
      reloadUser,
      signIn: signInWithEmail,
      // signInApple,
      signOut,
      signUp: signUpWithEmail,
      temporarySetProfile,
      tryOtp,
      user: user1,
    }),
    [
      signInWithEmail,
      signUpWithEmail,
      signOut,
      user1,
      // signInApple,
      tryOtp,
      temporarySetProfile,
      reloadUser,
    ],
  );

  // if (loading) return <Text>Loading...</Text>;
  return (
    <AuthContext value={authContextValue}>
      {children}
    </AuthContext>
  );
};
