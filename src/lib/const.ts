export const SELECTED_PROJECT_ID = 'selectedProjectId';
export const ROOT_FOLDER_KEY = 'rootFolderPath';
export const PREVENT_FOLDERNAME_EXPAND = false;

export const USER_AVATAR_BUCKET_NAME = 'user_public';
export const QUERY_KEYS = {
  usersByRole: ({
    role,
  }: {
    role: 'user' | 'manager' | 'staff';
  }) => ['usersByRole', { role }],
  concierge: {
    all: () => ['concierge', 'all'],
    detail: ({ conciergeId }: { conciergeId: number }) => ['concierge', 'detail', { conciergeId }],
    categories: () => ['concierge', 'categories'],
    category: ({ categoryId }: { categoryId: number }) => ['concierge', 'category', { categoryId }],
  },
  staff: {
    match: ({ staffId, userId }: { staffId: string; userId: string }) => ['staff', 'match', { staffId, userId }],
    messages: ({ matchId }: { matchId: number }) => ['staff', 'messages', { matchId }],
  },
} as const;
export const SUPABASE_FUNCTION_NAMES = {
  bigFunction: {
    functionName: 'big-function',
    paths: {
      adminUpdateUser: 'adminUpdateUser',
      communityMatchWithManager: 'communityMatchWithManager',
      adminUpdateUserAppmeta: 'adminUpdateUserAppmeta',
      staffRequest: 'staffRequest',
      adminListUsersByRole: 'adminListUsersByRole',
      adminGetUserData: 'adminGetUserData',
    },
  },
  revenuecat: {
    revenuecatFunctions: 'revenuecatFunctions',
  },
  user: {
    acceptRecommendation: 'acceptRecommendation',

    // stripe: "stripe",
    auth: 'auth',
    pushNotificationTest: 'pushNotificationTest',
    rejectRecommendation: 'rejectRecommendation',
    staffRegister: 'staffRegister',
    userGetRecommendations: 'userGetRecommendations',
  },
} as const;
