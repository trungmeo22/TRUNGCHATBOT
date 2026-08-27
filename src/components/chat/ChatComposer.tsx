import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Square } from 'lucide-react';

interface ChatComposerProps {
  isLoading: boolean;
  onSendMessage: (query: string) => void;
  onStop: () => void;
  initialValue?: string;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  isLoading,
  onSendMessage,
  onStop,
  initialValue = '',
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
      className="w-full max-w-[720px] mx-auto px-3 sm:px-4 pb-1 pt-0.5"
    >
      <div className="relative flex items-end rounded-2xl bg-white border border-gray-200 shadow-lg ring-1 ring-black/[0.02] focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all p-1.5 sm:p-2">
        <textarea
          ref={textareaRef}
          id="chat-query-textarea"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="Hỏi một câu hỏi y khoa..."
          rows={1}
          disabled={isLoading}
          className="flex-1 max-h-[180px] min-h-[40px] py-2 px-3 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none resize-none leading-relaxed border-none"
          aria-label="Nhập câu hỏi y khoa"
        />

        <div className="flex items-center gap-1 shrink-0 pb-0.5 pr-0.5">
          {isLoading ? (
            <button
              type="button"
              id="stop-generation-btn"
              onClick={onStop}
              className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
              title="Dừng tra cứu"
              aria-label="Dừng quá trình tra cứu"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          ) : (
            <button
              type="button"
              id="send-query-btn"
              onClick={handleSend}
              disabled={!canSubmit}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                canSubmit
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
              title="Gửi câu hỏi (Enter)"
              aria-label="Gửi câu hỏi"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          )}
        </div>
      </div>

      <p className="text-[10px] text-center text-gray-400 mt-2">
        Câu trả lời được tổng hợp từ các tài liệu đã được lập chỉ mục và kèm nguồn để kiểm chứng.
      </p>
    </div>
  );
};
