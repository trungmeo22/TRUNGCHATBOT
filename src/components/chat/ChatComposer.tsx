import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Square, Zap } from 'lucide-react';
import { SourcePolicySelector } from './SourcePolicySelector';
import { getChatEngine, setChatEngine, type ChatEngine } from '../../utils/engine';
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
  const [engine, setEngine] = useState<ChatEngine>(getChatEngine);

  const toggleEngine = () => {
    const next: ChatEngine = engine === 'v3' ? 'v2' : 'v3';
    setChatEngine(next);
    setEngine(next);
  };
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
      {/* Top action bar: Source Policy Selector and the v2/v3 engine switch */}
      <div className="flex items-center justify-between gap-2 px-1 mb-2">
        {onPolicyChange ? (
          <SourcePolicySelector
            currentPolicy={sourcePolicy}
            onPolicyChange={onPolicyChange}
            disabled={isLoading}
          />
        ) : (
          <span />
        )}
        <button
          type="button"
          id="engine-toggle-btn"
          onClick={toggleEngine}
          disabled={isLoading}
          aria-pressed={engine === 'v3'}
          title={
            engine === 'v3'
              ? 'v3: chữ hiện ngay khi đang viết; câu có số liệu chưa khớp nguồn được đánh dấu. Bấm để chuyển sang v2 (kiểm trước khi hiện, chậm hơn).'
              : 'v2: kiểm trước khi hiện, chậm hơn. Bấm để chuyển sang v3 (trả lời nhanh hơn, chữ hiện ngay).'
          }
          className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer ${
            engine === 'v3'
              ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
              : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Zap className={`w-3.5 h-3.5 ${engine === 'v3' ? 'fill-current' : ''}`} />
          {engine === 'v3' ? 'v3 nhanh' : 'v2'}
        </button>
      </div>

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
