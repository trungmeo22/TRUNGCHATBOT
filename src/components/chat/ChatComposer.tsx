import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import { SourcePolicySelector } from './SourcePolicySelector';
import type { SourcePolicy } from '../../types/chat';

interface ChatComposerProps {
  isLoading: boolean;
  onSendMessage: (query: string) => void;
  onStop: () => void;
  initialValue?: string;
  sourcePolicy?: SourcePolicy;
  onPolicyChange?: (newPolicy: SourcePolicy) => void;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  isLoading,
  onSendMessage,
  onStop,
  initialValue = '',
  sourcePolicy,
  onPolicyChange,
}) => {
  const [input, setInput] = useState(initialValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync initial value if provided from suggestion
  useEffect(() => {
    if (initialValue) {
      setInput(initialValue);
      if (textareaRef.current) {
        textareaRef.current.focus();
        adjustTextareaHeight(textareaRef.current);
      }
    }
  }, [initialValue]);

  // Adjust height on input change (1 to 6 lines)
  const adjustTextareaHeight = (element: HTMLTextAreaElement) => {
    element.style.height = 'auto';
    const newHeight = Math.min(element.scrollHeight, 180);
    element.style.height = `${newHeight}px`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    adjustTextareaHeight(e.target);
  };

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    onSendMessage(trimmed);
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // Refocus on desktop
      if (window.innerWidth > 768) {
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const canSubmit = input.trim().length > 0 && !isLoading;

  return (
    <div
      id="chat-composer-container"
      className="w-full max-w-[760px] mx-auto px-3 sm:px-4 pb-1 pt-0.5"
    >
      {/* Top action bar with Source Policy Selector */}
      {onPolicyChange && (
        <div className="flex items-center justify-between px-1 mb-2">
          <SourcePolicySelector
            currentPolicy={sourcePolicy}
            onPolicyChange={onPolicyChange}
            disabled={isLoading}
          />
        </div>
      )}

      <div className="relative flex items-end rounded-2xl bg-white border border-gray-200 shadow-lg ring-1 ring-black/[0.02] focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all p-2 sm:p-2.5">
        <textarea
          ref={textareaRef}
          id="chat-query-textarea"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Hỏi một câu hỏi y khoa..."
          rows={1}
          disabled={isLoading}
          className="flex-1 max-h-[180px] min-h-[42px] py-2 px-3 bg-transparent text-[15.5px] text-gray-900 placeholder:text-gray-400 focus:outline-none resize-none leading-relaxed border-none"
          aria-label="Nhập câu hỏi y khoa"
        />

        <div className="flex items-center gap-1 shrink-0 pb-0.5 pr-0.5">
          {isLoading ? (
            <button
              type="button"
              id="stop-generation-btn"
              onClick={onStop}
              className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Dừng tra cứu"
              aria-label="Dừng quá trình tra cứu"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              id="send-query-btn"
              onClick={handleSend}
              disabled={!canSubmit}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                canSubmit
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
              title="Gửi câu hỏi (Enter)"
              aria-label="Gửi câu hỏi"
            >
              <ArrowUp className="w-4.5 h-4.5 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
