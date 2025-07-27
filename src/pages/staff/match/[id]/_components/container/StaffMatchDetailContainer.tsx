import { useAuth } from '@matart15/lib_authentication_supabase';
import React from 'react';

import { useStaffMatchChat } from '../hooks/useStaffMatchChat';
import { StaffMatchChat } from '../ui/StaffMatchChat';

const isMobile = false; // TODO: Replace with real mobile detection if needed

export function StaffMatchDetailContainer({ matchId }: { matchId: number }) {
  const { user } = useAuth();
  const userId = user?.id;
  // Always call hooks at the top
  const chat = useStaffMatchChat(matchId, userId || '');

  if (!userId) {
    return <div>Loading user...</div>;
  }

  return (
    <div className=" flex-1 flex flex-col ">
      <StaffMatchChat
        messages={chat.messages}
        onSend={text => chat.sendMessage(text)}
        onImageSend={async (file) => {
          const path = await chat.uploadImage(file);
          if (path) {
            chat.sendMessage('', path);
          }
        }}
        loading={chat.loading}
        userId={userId}
        isMobile={isMobile}
      />
    </div>
  );
}
