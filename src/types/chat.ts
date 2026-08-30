export type SourceGroup = 'BYT' | 'VN_ASSOC' | 'INTL_TOP_ASSOC';

export interface SourcePolicy {
  scope: 'all';
  groups: SourceGroup[];
  [key: string]: unknown;
}

export interface Citation {
  evidence_id: string; // e.g. "E1", "E2"
  document_id?: string;
  document_title?: string;

  organization?: string;
  publication_year?: number;
  document_type?: string;

  source_group?: string;
  source_category?: string;
  source_category_name?: string;
  source_geographic_scope?: string;
  source_category_source?: string;

  page_number?: number | string;
  section_id?: string;
  breadcrumb?: string;
  source_unit_id?: string;
  source_unit_type?: string;
  matched_unit_type?: string;

  quote?: string;
  quote_preview?: string;
  source_text?: string;
  evidence_text?: string;
  url?: string;

  retrieval_rank?: number;
  retrieval_score?: number;

  [key: string]: unknown;
}

export interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  query: string;
  conversation_id?: string;
  source_policy?: SourcePolicy;
  top_k?: number;
  context_radius?: number;
  max_context_chars?: number;
  history?: HistoryMessage[];
}

export interface ChatResponse {
  status: string;
  answer: string;
  citations?: Citation[];

  /**
   * V2 backend production contract currently returns citations using an
   * uppercase top-level key. Keep both spellings supported so the frontend is
   * tolerant while the API contract is stabilized.
   */
  CITATIONS?: Citation[];

  conversation?: {
    conversation_id?: string;
    memory_version?: string;
    persistent_memory?: boolean;
    memory_existed?: boolean;
    source_policy_origin?: string;
    recent_turns_loaded?: number;
    older_turns_loaded?: number;
    rolling_summary_used?: boolean;
    pinned_fact_count?: number;
    history_turns_used?: number;
    retrieval_context_used?: boolean;
    retrieval_resolution_mode?: string;
    retrieval_intent?: string | null;
    retrieval_intent_origin?: string;
    [key: string]: unknown;
  };

  source_policy?: {
    scope?: string;
    groups?: string[];
    origin?: string;
    coverage_warning?: string | null;
    [key: string]: unknown;
  };

  grounding_validation?: {
    valid?: boolean;
    claim_count?: number;
    [key: string]: unknown;
  };

  v2?: {
    version?: string;
    grounding_gate?: string;
    evidence_selector?: string;
    retrieval_strategy?: string;
    [key: string]: unknown;
  };

  telemetry?: Record<string, unknown>;

  [key: string]: unknown;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  citations?: Citation[];
  status?: 'ok' | 'insufficient_evidence' | 'error';
  isStreaming?: boolean;
  errorDetails?: {
    code?: number | string;
    message: string;
  };
  sourcePolicyUsed?: SourcePolicy;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  sourcePolicy?: SourcePolicy;
}
