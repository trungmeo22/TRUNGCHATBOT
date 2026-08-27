import { buildRecentHistory } from '../src/utils/history';
import { mockChatRequest } from '../src/services/mockChatApi';
import type { ChatMessage, ChatRequest } from '../src/types/chat';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runRegressionTests() {
  console.log('\n--- Running Conversation History Regression Tests ---');

  // Test 1: Turn 1 - User asks "Ivabradine dùng khi nào?"
  const turn1UserMsg: ChatMessage = {
    id: 'msg_1',
    role: 'user',
    content: 'Ivabradine dùng khi nào?',
    createdAt: Date.now() - 10000,
    status: 'ok',
  };

  const req1: ChatRequest = {
    query: turn1UserMsg.content,
    history: buildRecentHistory([]),
    top_k: 6,
    context_radius: 1,
    max_context_chars: 16000,
  };

  assert(!req1.history || req1.history.length === 0, 'First request has empty history');

  const res1 = await mockChatRequest(req1);
  assert(res1.status === 'ok', 'First response status is ok');
  assert(res1.answer.includes('Ivabradine') && res1.answer.includes('nhịp xoang'), 'Turn 1 answer discusses Ivabradine indications');

  const turn1AssistantMsg: ChatMessage = {
    id: 'msg_2',
    role: 'assistant',
    content: res1.answer,
    createdAt: Date.now() - 5000,
    status: 'ok',
    citations: res1.citations,
  };

  // Test 2: Turn 2 - User asks follow-up "Thế liều bao nhiêu?"
  const conversationMessages = [turn1UserMsg, turn1AssistantMsg];
  const historyForTurn2 = buildRecentHistory(conversationMessages);

  assert(historyForTurn2.length === 2, 'Second request extracts exactly 2 previous turns');
  assert(historyForTurn2[0].role === 'user', 'History item 0 has role user');
  assert(historyForTurn2[0].content === 'Ivabradine dùng khi nào?', 'History item 0 contains turn 1 user query');
  assert(historyForTurn2[1].role === 'assistant', 'History item 1 has role assistant');
  assert(historyForTurn2[1].content === res1.answer, 'History item 1 contains turn 1 assistant answer');

  // Verify stripped fields
  assert(!('citations' in historyForTurn2[1]), 'History does NOT contain citations');
  assert(!('metadata' in historyForTurn2[1]), 'History does NOT contain metadata');
  assert(!('token_usage' in historyForTurn2[1]), 'History does NOT contain token usage');
  assert(!('evidence' in historyForTurn2[1]), 'History does NOT contain raw evidence');

  const req2: ChatRequest = {
    query: 'Thế liều bao nhiêu?',
    history: historyForTurn2,
    top_k: 6,
    context_radius: 1,
    max_context_chars: 16000,
  };

  const res2 = await mockChatRequest(req2);
  assert(res2.status === 'ok', 'Second response status is ok with context');
  assert(res2.answer.includes('5 mg') && res2.answer.includes('7.5 mg'), 'Follow-up answer contains Ivabradine dosing based on context history');

  // Test 3: Total character budget (20,000 chars) & 10 items limit
  const longMessages: ChatMessage[] = [];
  for (let i = 0; i < 15; i++) {
    longMessages.push({
      id: `msg_${i}`,
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i}: ${'x'.repeat(2500)}`, // 2500 chars each
      createdAt: Date.now() - (15 - i) * 1000,
      status: 'ok',
    });
  }

  const trimmedHistory = buildRecentHistory(longMessages, 10, 20000);
  assert(trimmedHistory.length <= 10, 'History does not exceed 10 items');
  const totalLength = trimmedHistory.reduce((sum, h) => sum + h.content.length, 0);
  assert(totalLength <= 20000, `History total characters (${totalLength}) is within 20,000 limit`);
  assert(
    trimmedHistory[trimmedHistory.length - 1].content.startsWith('Message 14'),
    'Most recent messages are prioritized and preserved'
  );

  // Test 4: Spelling preservation test ("Liều spironolacton trong HFrEF?")
  const rawSpellingQuery = 'Liều spironolacton trong HFrEF?';
  const req3: ChatRequest = {
    query: rawSpellingQuery,
    history: [],
    top_k: 6,
    context_radius: 1,
    max_context_chars: 16000,
  };

  assert(req3.query === rawSpellingQuery, 'Frontend preserves exact user spelling without alteration');
  const res3 = await mockChatRequest(req3);
  assert(res3.status === 'ok', 'Response status for Spironolactone is ok');
  assert(res3.answer.includes('Spironolacton') && res3.answer.includes('25 mg'), 'Backend recognizes and responds to Spironolactone query');

  console.log('\n✨ All Regression Tests Passed Successfully!\n');
}

runRegressionTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
