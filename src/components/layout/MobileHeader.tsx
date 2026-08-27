import React from 'react';
import { Menu, Plus, ShieldCheck } from 'lucide-react';

interface MobileHeaderProps {
  onOpenSidebar: () => void;
  onNewChat: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  onOpenSidebar,
  onNewChat,
}) => {
  return (
    <header
      id="mobile-header"
      className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 shrink-0 z-20"
    >
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          id="mobile-hamburger-btn"
          onClick={onOpenSidebar}
          className="p-1.5 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 text-xs font-semibold shadow-2xs hover:bg-gray-100"
      >
        <Plus className="w-3.5 h-3.5 text-gray-700" />
        <span>Mới</span>
      </button>
    </header>
  );
};
