import React, { useState, useEffect, useRef } from 'react';
import type { Conversation } from '../../types/chat';
import { checkKnowledgeEngineHealth } from '../../services/chatApi';
import {
  ShieldCheck,
  Plus,
  MessageSquare,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  X,
  PanelLeftClose,
} from 'lucide-react';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onClose?: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onDeleteConversation,
  onClose,
  onCloseMobile,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [engineStatus, setEngineStatus] = useState<'ready' | 'mock' | 'error'>('ready');
  const [engineLabel, setEngineLabel] = useState('Knowledge Engine');

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkKnowledgeEngineHealth().then((res) => {
      setEngineStatus(res.status);
      setEngineLabel(res.message);
    });
  }, []);

  // Close 3-dot dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleStartRename = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
    setMenuOpenId(null);
  };

  const handleSaveRename = (id: string, e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.stopPropagation();
    onRenameConversation(id, editTitle);
    setEditingId(null);
  };

  const handleCancelRename = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteConversation(id);
    setMenuOpenId(null);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  };

  return (
    <aside
      id="app-sidebar"
      className="w-full md:w-[260px] h-full bg-white flex flex-col justify-between select-none"
    >
      {/* Brand & New Chat Button */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Brand & Close/Collapse button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 shrink-0 bg-blue-600 rounded flex items-center justify-center text-white shadow-2xs">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-base tracking-tight text-gray-900 truncate">
                Tra cứu Y khoa
              </h1>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold truncate">
                Evidence-grounded medical
              </p>
            </div>
          </div>

          {/* Hide/Collapse Navigation Button */}
          {(onClose || onCloseMobile) && (
            <button
              type="button"
              id="hide-navigation-btn"
              onClick={() => {
                if (onClose) onClose();
                if (onCloseMobile) onCloseMobile();
              }}
              className="p-1.5 -mr-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Ẩn thanh điều hướng"
              aria-label="Ẩn thanh điều hướng"
            >
              <PanelLeftClose className="w-4 h-4 hidden md:block" />
              <X className="w-4 h-4 md:hidden" />
            </button>
          )}
        </div>

        {/* New Conversation Button */}
        <div>
          <button
            type="button"
            id="new-chat-button"
            onClick={() => {
              onNewConversation();
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 text-gray-700" />
            <span>Cuộc trò chuyện mới</span>
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1">
        <h2 className="px-2 mb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Lịch sử tra cứu
        </h2>

        {conversations.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-gray-400 italic">
            Chưa có lịch sử câu hỏi nào
          </div>
        ) : (
          conversations.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const isEditing = editingId === conv.id;

            return (
              <div
                key={conv.id}
                id={`conversation-item-${conv.id}`}
                onClick={() => {
                  if (!isEditing) {
                    onSelectConversation(conv.id);
                    if (onCloseMobile) onCloseMobile();
                  }
                }}
                className={`group relative flex items-center justify-between px-2.5 py-2 rounded-md text-sm transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium border-l-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                  <MessageSquare
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />

                  {isEditing ? (
                    <div className="flex items-center gap-1 flex-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(conv.id, e);
                          if (e.key === 'Escape') handleCancelRename(e as any);
                        }}
                        autoFocus
                        className="w-full bg-white px-1.5 py-0.5 text-xs rounded border border-blue-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={(e) => handleSaveRename(conv.id, e)}
                        className="p-1 hover:text-blue-700 text-blue-600"
                        title="Lưu"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelRename}
                        className="p-1 hover:text-gray-700 text-gray-400"
                        title="Hủy"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate leading-snug">{conv.title}</span>
                      <span className="text-[10px] text-gray-400 font-normal">
                        {formatTimestamp(conv.updatedAt)}
                      </span>
                    </div>
                  )}
                </div>

                {/* 3-dots Menu for Rename / Delete */}
                {!isEditing && (
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === conv.id ? null : conv.id);
                      }}
                      className={`p-1 rounded hover:bg-gray-200/60 text-gray-400 hover:text-gray-700 transition-opacity ${
                        isActive || menuOpenId === conv.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      aria-label="Tùy chọn cuộc trò chuyện"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {menuOpenId === conv.id && (
                      <div
                        ref={menuRef}
                        className="absolute right-0 top-full mt-1 w-28 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-30 animate-in fade-in zoom-in-95"
                      >
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(conv, e)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] text-gray-700 hover:bg-gray-100 text-left"
                        >
                          <Pencil className="w-3 h-3 text-gray-500" />
                          <span>Đổi tên</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(conv.id, e)}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[11px] text-red-600 hover:bg-red-50 text-left"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                          <span>Xóa</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Status: Knowledge Engine Indicator */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              engineStatus === 'ready'
                ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                : engineStatus === 'mock'
                ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
            }`}
          />
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
            Knowledge Engine
          </span>
        </div>
        <span
          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
            engineStatus === 'ready'
              ? 'text-emerald-600 bg-emerald-50'
              : engineStatus === 'mock'
              ? 'text-amber-600 bg-amber-50'
              : 'text-red-600 bg-red-50'
          }`}
        >
          {engineStatus === 'ready' ? 'Sẵn sàng' : engineStatus === 'mock' ? 'Mock' : 'Chưa kết nối'}
        </span>
      </div>
    </aside>
  );
};
