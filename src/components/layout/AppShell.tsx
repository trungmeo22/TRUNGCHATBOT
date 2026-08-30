import React, { useState } from 'react';
import type { Conversation, ChatMessage, Citation, SourcePolicy } from '../../types/chat';
import { Sidebar } from './Sidebar';
import { MobileHeader } from './MobileHeader';
import { ChatView } from '../chat/ChatView';
import { SplitDocumentViewer, type SplitViewDisplayMode } from '../citations/SplitDocumentViewer';
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
  activeCitationsList?: Citation[];
  isSourceDrawerOpen: boolean;
  splitViewMode?: SplitViewDisplayMode;
  onViewModeChange?: (mode: SplitViewDisplayMode) => void;
  splitWidthPercent?: number;
  onSplitWidthChange?: (width: number) => void;
  lastFailedQuery: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onUpdateSourcePolicy: (conversationId: string | null | undefined, policy: SourcePolicy) => void;
  onSendMessage: (query: string) => void;
  onStop: () => void;
  onSelectCitation: (citation: Citation, messageCitations?: Citation[]) => void;
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
  activeCitationsList = [],
  isSourceDrawerOpen,
  splitViewMode = 'split',
  onViewModeChange,
  splitWidthPercent = 50,
  onSplitWidthChange,
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

  const isDocumentOpen = isSourceDrawerOpen && Boolean(selectedCitation);
  const isDesktopSplitActive = isDocumentOpen && splitViewMode === 'split';
  const isDesktopFullActive = isDocumentOpen && splitViewMode === 'full';
  const isDesktopDrawerActive = isDocumentOpen && splitViewMode === 'drawer';

  // Compute CSS width class for split view panel
  const getSplitWidthStyle = () => {
    if (splitWidthPercent === 40) return 'w-[40%]';
    if (splitWidthPercent === 60) return 'w-[60%]';
    return 'w-[50%]';
  };

  return (
    <div
      id="app-shell-root"
      className="fixed inset-0 flex h-[100dvh] w-full overflow-hidden bg-[#F9FAFB] font-sans antialiased text-gray-900"
    >
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

        {/* Split-View Container (Side-by-Side on Desktop) */}
        <div className="flex-1 flex flex-row h-full min-h-0 overflow-hidden relative">
          {/* Left Column: Chat Conversation Stream (Hidden if Full-screen Document mode on desktop) */}
          <main
            className={`flex flex-col h-full min-h-0 min-w-0 overflow-hidden transition-all duration-200 ${
              isDesktopFullActive
                ? 'hidden'
                : isDesktopSplitActive
                ? 'flex-1'
                : 'flex-1 w-full'
            }`}
          >
            <ChatView
              messages={currentMessages}
              isLoading={isLoading}
              loadingText={loadingText}
              selectedCitationId={selectedCitation?.evidence_id}
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

          {/* Right Column: Desktop Split-View Document Panel */}
          {isDocumentOpen && (isDesktopSplitActive || isDesktopFullActive) && (
            <div
              id="desktop-split-view-panel"
              className={`hidden md:flex flex-col h-full shrink-0 animate-in slide-in-from-right-3 duration-200 ${
                isDesktopFullActive ? 'w-full flex-1' : getSplitWidthStyle()
              }`}
            >
              <SplitDocumentViewer
                citation={selectedCitation}
                allCitations={activeCitationsList}
                isOpen={isDocumentOpen}
                viewMode={splitViewMode}
                onViewModeChange={onViewModeChange}
                onSelectCitation={onSelectCitation}
                onClose={onCloseSourceDrawer}
                splitWidthPercent={splitWidthPercent}
                onSplitWidthChange={onSplitWidthChange}
              />
            </div>
          )}
        </div>

        {/* Overlay Drawer mode (when user explicitly selects drawer mode on desktop) */}
        {isDocumentOpen && isDesktopDrawerActive && (
          <div
            id="desktop-overlay-drawer-container"
            className="hidden md:block fixed inset-0 z-50 overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            <div
              className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs transition-opacity animate-in fade-in"
              onClick={onCloseSourceDrawer}
              aria-hidden="true"
            />
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <div className="w-screen max-w-lg bg-white border-l border-gray-200 shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200 h-full">
                <SplitDocumentViewer
                  citation={selectedCitation}
                  allCitations={activeCitationsList}
                  isOpen={isDocumentOpen}
                  viewMode={splitViewMode}
                  onViewModeChange={onViewModeChange}
                  onSelectCitation={onSelectCitation}
                  onClose={onCloseSourceDrawer}
                  splitWidthPercent={splitWidthPercent}
                  onSplitWidthChange={onSplitWidthChange}
                />
              </div>
            </div>
          </div>
        )}

        {/* Mobile Document Modal / Bottom Sheet */}
        {isDocumentOpen && (
          <div
            id="mobile-document-modal"
            className="md:hidden fixed inset-0 z-50 flex flex-col bg-white animate-in slide-in-from-bottom duration-200"
            role="dialog"
            aria-modal="true"
          >
            <SplitDocumentViewer
              citation={selectedCitation}
              allCitations={activeCitationsList}
              isOpen={isDocumentOpen}
              viewMode="split"
              onSelectCitation={onSelectCitation}
              onClose={onCloseSourceDrawer}
            />
          </div>
        )}

        {/* Global Toast */}
        <Toast message={toastMessage} isVisible={isToastVisible} />
      </div>
    </div>
  );
};
