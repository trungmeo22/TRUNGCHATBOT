import React from 'react';
import { Menu, Plus, ShieldCheck } from 'lucide-react';

interface MobileHeaderProps {
  isVisible?: boolean;
  onOpenSidebar: () => void;
  onNewChat: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  isVisible = true,
  onOpenSidebar,
  onNewChat,
}) => {
  return (
    <header
      id="mobile-header"
      className={`md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between px-4 py-3 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs transition-all duration-300 ease-out ${
        isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          id="mobile-hamburger-btn"
          onClick={onOpenSidebar}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer transition-colors"
          aria-label="Mở danh mục cuộc trò chuyện"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white shadow-2xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-gray-900 tracking-tight">
            Tra cứu Y khoa
          </span>
        </div>
      </div>

      <button
        type="button"
        id="mobile-new-chat-btn"
        onClick={onNewChat}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer active:scale-95"
      >
        <Plus className="w-3.5 h-3.5 text-blue-600" />
        <span>Mới</span>
      </button>
    </header>
  );
};
