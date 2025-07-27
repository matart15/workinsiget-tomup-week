import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function StaffMatchChat({
  messages,
  onSend,
  onImageSend,
  loading,
  userId,
  isMobile,
}: {
  messages: any[];
  onSend: (text: string) => void;
  onImageSend: (file: File) => void;
  loading: boolean;
  userId: string;
  isMobile: boolean;
}) {
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Card className="flex flex-1 flex-col ">
      <CardContent className="flex-1 overflow-y-auto flex flex-col-reverse gap-2 pb-2">
        {messages.map((msg, i) => {
          const isMine = msg.sender_id === userId;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-lg px-3 py-2 max-w-xs ${isMine ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {msg.image_url && (
                  <img src={msg.image_url} alt="img" className="mb-1 max-w-[200px] rounded" />
                )}
                <div>{msg.content}</div>
              </div>
            </div>
          );
        })}
      </CardContent>
      <form
        className="flex gap-2 items-center p-2 border-t"
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim()) {
            onSend(input);
            setInput('');
          }
        }}
        style={{ marginTop: 'auto' }}
      >
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          disabled={loading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          📎
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              onImageSend(e.target.files[0]);
              e.target.value = '';
            }
          }}
          capture={isMobile ? 'environment' : undefined}
        />
        <Button type="submit" disabled={loading || !input.trim()}>Send</Button>
      </form>
    </Card>
  );
}
