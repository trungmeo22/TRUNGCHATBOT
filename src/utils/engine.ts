/**
 * Which answer pipeline the chat uses.
 *  - v3: /api/chat-v3/stream (default) - text streams as the model writes it;
 *        sentences whose figures do not match the cited source are marked
 *        "[nguồn chưa đảm bảo]" inline.
 *  - v2: /api/chat-v2/stream - answer validated before it is shown (slower).
 * Stored per browser; `?engine=v2` / `?engine=v3` in the URL sets it.
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
    return localStorage.getItem(ENGINE_KEY) === 'v2' ? 'v2' : 'v3';
  } catch {
    return 'v3';
  }
}

export function setChatEngine(engine: ChatEngine): void {
  try {
    localStorage.setItem(ENGINE_KEY, engine);
  } catch {
    // Storage unavailable (private mode): the choice lasts for this page only.
  }
}

/**
 * How the v3 engine answers.
 *  - grounded (default): only from the internal documents.
 *  - free: internal documents first, then general medical knowledge, which the
 *    server puts in a separate, labelled section without citations.
 * Stored per browser. v2 ignores it.
 */
export type AnswerMode = 'grounded' | 'free';

const ANSWER_MODE_KEY = 'med_answer_mode';

export function getAnswerMode(): AnswerMode {
  try {
    return localStorage.getItem(ANSWER_MODE_KEY) === 'free' ? 'free' : 'grounded';
  } catch {
    return 'grounded';
  }
}

export function setAnswerMode(mode: AnswerMode): void {
  try {
    localStorage.setItem(ANSWER_MODE_KEY, mode);
  } catch {
    // Storage unavailable (private mode): the choice lasts for this page only.
  }
}
