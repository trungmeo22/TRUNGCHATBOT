import React, { useState } from 'react';
import type { Conversation, ChatMessage, Citation } from '../../types/chat';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { ChatView } from '../chat/ChatView';
import { SourceDrawer } from '../citations/SourceDrawer';
import { Toast } from '../ui/Toast';

interface AppShellProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  activeConversation: Conversation | null;
  isLoading: boolean;
  loadingText: string;
  selectedCitation: Citation | null;
  isSourceDrawerOpen: boolean;
  lastFailedQuery: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
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
  isLoading,
  loadingText,
  selectedCitation,
  isSourceDrawerOpen,
  lastFailedQuery,
  onSelectConversation,
  onNewConversation,
  onRenameConversation,
  onDeleteConversation,
  onSendMessage,
  onStop,
  onSelectCitation,
  onCloseSourceDrawer,
  onRetryLast,
}) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isToastVisible, setIsToastVisible] = useState(false);

  const showToast = (message: string) => {
    setToastMessage(message);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, 2200);
  };

  const currentMessages: ChatMessage[] = activeConversation?.messages || [];

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
    <div id="app-shell-root" className="flex h-screen w-full overflow-hidden bg-[#F9FAFB] font-sans antialiased text-gray-900">
      {/* Desktop Sidebar (Permanent, ~260px) */}
      <div className="hidden md:flex shrink-0 h-full">
        <Sidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={onSelectConversation}
          onNewConversation={onNewConversation}
          onRenameConversation={onRenameConversation}
          onDeleteConversation={onDeleteConversation}
        />
      </div>

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
              onSelectConversation={onSelectConversation}
              onNewConversation={onNewConversation}
              onRenameConversation={onRenameConversation}
              onDeleteConversation={onDeleteConversation}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Mobile Header */}
        <MobileHeader
          onOpenSidebar={() => setIsMobileSidebarOpen(true)}
          onNewChat={onNewConversation}
        />

        {/* Chat Area with centered max-width */}
        <main className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
          <ChatView
            messages={currentMessages}
            isLoading={isLoading}
            loadingText={loadingText}
            onSendMessage={onSendMessage}
            onStop={onStop}
            onSelectCitation={onSelectCitation}
            onCopyText={() => showToast('Đã sao chép vào bộ nhớ tạm')}
            onRetryLast={handleRetry}
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
