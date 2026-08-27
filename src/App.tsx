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
    createNewConversation,
    selectConversation,
    clearActiveConversation,
    renameConversation,
    deleteConversation,
    addMessageToConversation,
    updateLastMessageInConversation,
  } = useConversations();

  const {
    isLoading,
    loadingText,
    selectedCitation,
    isSourceDrawerOpen,
    lastFailedQuery,
    openCitationDrawer,
    closeCitationDrawer,
    sendMessage,
    stopGeneration,
    retryLastMessage,
  } = useChat({
    activeConversationId,
    createNewConversation,
    addMessageToConversation,
    updateLastMessageInConversation,
  });

  return (
    <AppShell
      conversations={conversations}
      activeConversationId={activeConversationId}
      activeConversation={activeConversation}
      isLoading={isLoading}
      loadingText={loadingText}
      selectedCitation={selectedCitation}
      isSourceDrawerOpen={isSourceDrawerOpen}
      lastFailedQuery={lastFailedQuery}
      onSelectConversation={selectConversation}
      onNewConversation={clearActiveConversation}
      onRenameConversation={renameConversation}
      onDeleteConversation={deleteConversation}
      onSendMessage={sendMessage}
      onStop={stopGeneration}
      onSelectCitation={openCitationDrawer}
      onCloseSourceDrawer={closeCitationDrawer}
      onRetryLast={retryLastMessage}
    />
  );
}

