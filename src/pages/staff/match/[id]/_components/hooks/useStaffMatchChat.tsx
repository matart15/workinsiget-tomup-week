import { useCallback, useEffect, useRef, useState } from 'react';

import { supabase } from '@/lib/supabase';

export type StaffMessage = {
  id: number;
  created_at: string;
  content: string;
  image_url?: string | null;
  match_id: number;
  sender_id: string;
};

export function useStaffMatchChat(matchId: number, userId: string) {
  const [messages, setMessages] = useState<StaffMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastMessageTime = useRef<string | null>(null);

  // Fetch messages
  const loadMessages = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('s_messages')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at', { ascending: false });
    if (lastMessageTime.current) {
      query = query.lt('created_at', lastMessageTime.current);
    }
    const { data, error } = await query.limit(20);
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    if (!data || data.length === 0) {
      setLoading(false);
      return;
    }
    lastMessageTime.current = data[data.length - 1]?.created_at || null;
    setMessages((prev) => {
      // Combine previous and new messages, then deduplicate by id
      const combined = [
        ...prev,
        ...data.filter((d: any) => typeof d.id === 'number'),
      ];
      // Deduplicate by id (keep the first occurrence, which is the newest due to order)
      const seen = new Set();
      const deduped = [];
      for (const msg of combined) {
        if (!seen.has(msg.id)) {
          seen.add(msg.id);
          deduped.push(msg);
        }
      }
      return deduped;
    });
    setLoading(false);
  }, [matchId]);

  // Initial load
  useEffect(() => {
    setMessages([]);
    lastMessageTime.current = null;
    loadMessages();
  }, [matchId, loadMessages]);

  // Subscribe for new messages
  useEffect(() => {
    const channel = supabase
      .channel(`s_messages_insert_${matchId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        filter: `match_id=eq.${String(matchId)}`,
        schema: 'public',
        table: 's_messages',
      }, async (payload: any) => {
        const { data, error } = await supabase
          .from('s_messages')
          .select('*')
          .eq('id', payload.new.id)
          .single();
        if (!error && data && data.id !== undefined) {
          setMessages((prev) => {
            const exists = prev.find(m => m.id === data.id);
            if (exists) {
              return prev.map(m => m.id === data.id ? data : m);
            }
            return [data, ...prev];
          });
        }
      })
      .subscribe();
    return () => {
      channel.unsubscribe();
    };
  }, [matchId]);

  // Send message
  const sendMessage = useCallback(async (text: string, image_url?: string | null) => {
    const insertData: any = {
      match_id: matchId,
      content: text,
      image_url,
      sender_id: userId,
    };
    const { error } = await supabase.from('s_messages').insert(insertData);
    if (error) {
      setError(error.message);
    }
  }, [matchId, userId]);

  // Image upload
  const uploadImage = useCallback(async (file: File) => {
    const filePath = `${matchId}/${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage.from('user-messages').upload(filePath, file);
    if (error) {
      setError(error.message);
      return null;
    }
    return data?.path || null;
  }, [matchId]);

  return {
    messages,
    loading,
    error,
    loadMessages,
    sendMessage,
    uploadImage,
  };
}
