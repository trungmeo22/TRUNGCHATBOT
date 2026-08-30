import React, { useState } from 'react';
import type { Conversation, ChatMessage, Citation, SourcePolicy } from '../../types/chat';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { ChatView } from '../chat/ChatView';
import { SourceDrawer } from '../citations/SourceDrawer';
import { Toast } from '../ui/Toast';
import { PanelLeftOpen } from 'lucide-react';

interface AppShellProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  currentSourcePolicy?: SourcePolicy;
  isLoading: boolean;
  loadingText: string;
  selectedCitation: Citation | null;
  isSourceDrawerOpen: boolean;
  lastFailedQuery: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onUpdateSourcePolicy: (conversationId: string | null | undefined, policy: SourcePolicy) => void;
  onSendMessage: (query: string) => void;
  onStop: () => void;
  onSelectCitation: (citation: Citation) => void;
  onCloseSourceDrawer: () => void;
  onRetryLast: (query: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  conversations,
  activeConversationId,
  activeConversation,
  currentSourcePolicy,
  isLoading,
  loadingText,
  selectedCitation,
  isSourceDrawerOpen,
  lastFailedQuery,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onDeleteConversation,
  onUpdateSourcePolicy,
  onSendMessage,
  onStop,
  onSelectCitation,
  onCloseSourceDrawer,
  onRetryLast,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, 2200);
  };

  const handleNewChat = () => {
    setIsHeaderVisible(true);
    onNewConversation();
  };

  const handleSelectConv = (id: string) => {
    setIsHeaderVisible(true);
    onSelectConversation(id);
  };

  const currentMessages: ChatMessage[] = activeConversation?.messages || [];
  const effectiveSourcePolicy = activeConversation?.sourcePolicy || currentSourcePolicy;

  const handlePolicyChange = (newPolicy: SourcePolicy) => {
    onUpdateSourcePolicy(activeConversationId, newPolicy);
    showToast('Đã cập nhật phạm vi nguồn tài liệu');
  };

  const handleRetry = () => {
    if (lastFailedQuery) {
      onRetryLast(lastFailedQuery);
    } else if (currentMessages.length > 0) {
      const lastUserMsg = [...currentMessages].reverse().find((m) => m.role === 'user');
      if (lastUserMsg) {
        onRetryLast(lastUserMsg.content);
      }
    }
  };

  return (
    <div id="app-shell-root" className="fixed inset-0 flex h-[100dvh] w-full overflow-hidden bg-[#F9FAFB] font-sans antialiased text-gray-900">
      {/* Desktop Sidebar (~260px, collapsible) */}
      {isDesktopSidebarOpen && (
        <div className="hidden md:flex shrink-0 h-full animate-in slide-in-from-left-2 duration-200">
          <Sidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={handleSelectConv}
            onNewConversation={handleNewChat}
            onRenameConversation={onRenameConversation}
            onDeleteConversation={onDeleteConversation}
            onClose={() => setIsDesktopSidebarOpen(false)}
          />
        </div>
      )}

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isMobileSidebarOpen && (
        <div
          id="mobile-sidebar-drawer"
          className="md:hidden fixed inset-0 z-40 flex"
          role="dialog"
          aria-modal="true"
        >
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs animate-in fade-in"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl animate-in slide-in-from-left duration-200">
            <Sidebar
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={(id) => {
                handleSelectConv(id);
                setIsMobileSidebarOpen(false);
              }}
              onNewConversation={() => {
                handleNewChat();
                setIsMobileSidebarOpen(false);
              }}
              onRenameConversation={onRenameConversation}
              onDeleteConversation={onDeleteConversation}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Desktop floating reopen sidebar button when hidden */}
        {!isDesktopSidebarOpen && (
          <div className="hidden md:block absolute top-3 left-3 z-30 animate-in fade-in duration-200">
            <button
              type="button"
              id="desktop-reopen-sidebar-btn"
              onClick={() => setIsDesktopSidebarOpen(true)}
              className="p-2 rounded-lg bg-white border border-gray-200 shadow-xs hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
              title="Mở thanh điều hướng"
            >
              <PanelLeftOpen className="w-4 h-4 text-gray-700" />
              <span>Hiện danh mục</span>
            </button>
          </div>
        )}

        {/* Mobile Header with smooth dynamic reveal */}
        <MobileHeader
          isVisible={isHeaderVisible}
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
          onNewChat={handleNewChat}
        />

        {/* Chat Area with centered max-width */}
        <main className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
          <ChatView
            messages={currentMessages}
            isLoading={isLoading}
            loadingText={loadingText}
            sourcePolicy={effectiveSourcePolicy}
            onPolicyChange={handlePolicyChange}
            onSendMessage={(q) => {
              setIsHeaderVisible(true);
              onSendMessage(q);
            }}
            onStop={onStop}
            onSelectCitation={onSelectCitation}
            onCopyText={() => showToast('Đã sao chép vào bộ nhớ tạm')}
            onRetryLast={handleRetry}
            onHeaderVisibilityChange={setIsHeaderVisible}
          />
        </main>

        {/* Right Source Drawer */}
        <SourceDrawer
          isOpen={isSourceDrawerOpen}
          citation={selectedCitation}
          onClose={onCloseSourceDrawer}
        />

        {/* Global Toast */}
        <Toast message={toastMessage} isVisible={isToastVisible} />
      </div>
    </div>
  );
};
