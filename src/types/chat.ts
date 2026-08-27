export interface Citation {
  evidence_id: string; // e.g. "E1", "E2"
  document_id?: string;
  document_title: string;
  page_number?: number | string;
  section_id?: string;
  breadcrumb?: string;
  source_unit_id?: string;
  // Optional evidence texts for future/extended responses
  quote?: string;
  source_text?: string;
  evidence_text?: string;
  url?: string;
}

export interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  query: string;
  history?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  top_k?: number;
  context_radius?: number;
  max_context_chars?: number;
}

export interface ChatResponse {
  version?: string;
  status: "ok" | "insufficient_evidence" | "error" | string;
  query?: string;
  answer: string;
  citations?: Citation[];
  evidence?: {
    pack_version?: string;
    retrieval_count?: number;
    primary_count?: number;
    supporting_count?: number;
    source_of_truth?: string;
    must_cite_evidence_ids?: boolean;
    [key: string]: unknown;
  };
  query_intelligence?: {
    resolved_query?: string;
    original_query?: string;
    intent?: string;
    normalized_entities?: string[];
    [key: string]: unknown;
  };
  provider?: {
    provider?: string;
    model?: string;
    llm_calls?: number;
    usage?: Record<string, unknown>;
    [key: string]: unknown;
  };
  citation_validation?: {
    valid?: boolean;
    cited_ids?: string[];
    [key: string]: unknown;
  };
  grounding_validation?: {
    version?: string;
    valid?: boolean;
    claim_count?: number;
    validated_claims?: unknown[];
    [key: string]: unknown;
  };
  service_meta?: {
    service_version?: string;
    elapsed_ms?: number;
    llm_calls?: number;
    [key: string]: unknown;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
  citations?: Citation[];
  status?: "ok" | "insufficient_evidence" | "error";
  errorDetails?: {
    code?: number | string;
    message: string;
  };
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
}
