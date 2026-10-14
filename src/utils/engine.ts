/**
 * Which answer pipeline the chat uses.
 *  - v2: /api/chat-v2/stream (default) - answer validated before it is shown.
 *  - v3: /api/chat-v3/stream (trial) - text streams as the model writes it,
 *        citations are checked after the answer finishes.
 * Stored per browser; `?engine=v3` / `?engine=v2` in the URL sets it.
 */
export type ChatEngine = 'v2' | 'v3';

const ENGINE_KEY = 'med_chat_engine';

export function getChatEngine(): ChatEngine {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('engine');
    if (fromUrl === 'v2' || fromUrl === 'v3') {
      localStorage.setItem(ENGINE_KEY, fromUrl);
      return fromUrl;
    }
    return localStorage.getItem(ENGINE_KEY) === 'v3' ? 'v3' : 'v2';
  } catch {
    return 'v2';
  }
}

export function setChatEngine(engine: ChatEngine): void {
  try {
    localStorage.setItem(ENGINE_KEY, engine);
  } catch {
    // Storage unavailable (private mode): the choice lasts for this page only.
  }
}
