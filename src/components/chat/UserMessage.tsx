import React from 'react';
import type { ChatMessage } from '../../types/chat';

interface UserMessageProps {
  message: ChatMessage;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  return (
    <div
      id={`user-message-${message.id}`}
      className="flex items-start gap-4 max-w-[760px] mx-auto py-3.5 px-3 sm:px-4 rounded-xl transition-colors group"
    >
      <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0 flex items-center justify-center text-gray-700 font-bold text-xs shadow-2xs mt-0.5">
        BS
      </div>

      <div className="flex-1 pt-0.5 min-w-0">
        <div className="text-gray-900 font-medium leading-relaxed whitespace-pre-wrap text-[16px]">
          {message.content}
        </div>
      </div>
    </div>
  );
};

