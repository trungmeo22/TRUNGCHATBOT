/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useConversations } from './hooks/useConversations';
import { useChat } from './hooks/useChat';
import { AppShell } from './components/layout/AppShell';

export default function App() {
  const {
    conversations,
    activeConversationId,
    activeConversation,
    currentSourcePolicy,
    createNewConversation,
    selectConversation,
    clearActiveConversation,
    renameConversation,
    deleteConversation,
    addMessageToConversation,
    updateMessageInConversation,
    updateLastMessageInConversation,
    updateConversationSourcePolicy,
  } = useConversations();

  const {
    isLoading,
    loadingText,
    selectedCitation,
    activeCitationsList,
    isSourceDrawerOpen,
    splitViewMode,
    setSplitViewMode,
    splitWidthPercent,
    setSplitWidthPercent,
    lastFailedQuery,
    openCitationDrawer,
    closeCitationDrawer,
    sendMessage,
    stopGeneration,
    retryLastMessage,
  } = useChat({
    activeConversationId,
    activeConversation,
    currentSourcePolicy,
    createNewConversation,
    addMessageToConversation,
    updateMessageInConversation,
    updateLastMessageInConversation,
  });

  return (
    <AppShell
      conversations={conversations}
      activeConversationId={activeConversationId}
      activeConversation={activeConversation}
      currentSourcePolicy={currentSourcePolicy}
      isLoading={isLoading}
      loadingText={loadingText}
      selectedCitation={selectedCitation}
      activeCitationsList={activeCitationsList}
      isSourceDrawerOpen={isSourceDrawerOpen}
      splitViewMode={splitViewMode}
      onViewModeChange={setSplitViewMode}
      splitWidthPercent={splitWidthPercent}
      onSplitWidthChange={setSplitWidthPercent}
      lastFailedQuery={lastFailedQuery}
      onSelectConversation={selectConversation}
      onNewConversation={clearActiveConversation}
      onRenameConversation={renameConversation}
      onDeleteConversation={deleteConversation}
      onUpdateSourcePolicy={updateConversationSourcePolicy}
      onSendMessage={sendMessage}
      onStop={stopGeneration}
      onSelectCitation={openCitationDrawer}
      onCloseSourceDrawer={closeCitationDrawer}
      onRetryLast={retryLastMessage}
    />
  );
}
