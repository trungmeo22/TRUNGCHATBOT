import type { Citation } from '../types/chat';

/**
 * Normalizes any backend response structure or citation array into a consistent Citation[] array.
 * Tolerant to spelling variations (citations, CITATIONS, sources, evidence, quote_preview, doc_title, etc.)
 */
export function normalizeCitations(rawInput: unknown): Citation[] {
  if (!rawInput) return [];

  let rawList: unknown[] = [];

  if (Array.isArray(rawInput)) {
    rawList = rawInput;
  } else if (typeof rawInput === 'object' && rawInput !== null) {
    const obj = rawInput as Record<string, unknown>;

    if (Array.isArray(obj.citations)) {
      rawList = obj.citations;
    } else if (Array.isArray(obj.CITATIONS)) {
      rawList = obj.CITATIONS;
    } else if (Array.isArray(obj.sources)) {
      rawList = obj.sources;
    } else if (Array.isArray(obj.evidences)) {
      rawList = obj.evidences;
    } else if (Array.isArray(obj.evidence)) {
      rawList = obj.evidence;
    } else if (obj.evidence && typeof obj.evidence === 'object') {
      const evObj = obj.evidence as Record<string, unknown>;
      if (Array.isArray(evObj.citations)) {
        rawList = evObj.citations;
      } else if (Array.isArray(evObj.sources)) {
        rawList = evObj.sources;
      } else if (Array.isArray(evObj.items)) {
        rawList = evObj.items;
      } else if (Array.isArray(evObj.evidence_items)) {
        rawList = evObj.evidence_items;
      }
    } else if (obj.data && typeof obj.data === 'object') {
      const dataObj = obj.data as Record<string, unknown>;
      if (Array.isArray(dataObj.citations)) {
        rawList = dataObj.citations;
      } else if (Array.isArray(dataObj.sources)) {
        rawList = dataObj.sources;
      }
    } else if (obj.result && typeof obj.result === 'object') {
      const resObj = obj.result as Record<string, unknown>;
      if (Array.isArray(resObj.citations)) {
        rawList = resObj.citations;
      } else if (Array.isArray(resObj.sources)) {
        rawList = resObj.sources;
      }
    }
  }

  if (!rawList || rawList.length === 0) {
    return [];
  }

  const normalized: Citation[] = [];

  rawList.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;
    const raw = item as Record<string, unknown>;

    // 1. Evidence ID normalization (e.g. "E1", "e1", 1, "1" -> "E1")
    let rawEvidenceId =
      raw.evidence_id ??
      raw.evidenceId ??
      raw.id ??
      raw.evidence_number ??
      raw.evidence_num ??
      raw.num ??
      raw.idx;

    let evidenceIdStr = '';
    if (typeof rawEvidenceId === 'number') {
      evidenceIdStr = `E${rawEvidenceId}`;
    } else if (typeof rawEvidenceId === 'string' && rawEvidenceId.trim()) {
      const trimmed = rawEvidenceId.trim();
      const numMatch = trimmed.match(/^E?(\d+)$/i);
      if (numMatch) {
        evidenceIdStr = `E${numMatch[1]}`;
      } else {
        evidenceIdStr = trimmed.toUpperCase();
      }
    } else {
      evidenceIdStr = `E${index + 1}`;
    }

    // Helper to safely extract string or undefined (never empty string)
    const cleanStr = (val: unknown): string | undefined => {
      if (typeof val === 'string') {
        const trimmed = val.trim();
        return trimmed.length > 0 ? trimmed : undefined;
      }
      return undefined;
    };

    // Helper for publication year
    let publicationYear: number | undefined = undefined;
    const rawYear = raw.publication_year ?? raw.publicationYear ?? raw.year ?? raw.published_year ?? raw.pub_year ?? raw.date;
    if (typeof rawYear === 'number' && Number.isInteger(rawYear) && rawYear > 1900 && rawYear < 2100) {
      publicationYear = rawYear;
    } else if (typeof rawYear === 'string') {
      const yearMatch = rawYear.match(/\b(19\d\d|20\d\d)\b/);
      if (yearMatch) {
        publicationYear = parseInt(yearMatch[1], 10);
      }
    }

    // Helper for page number
    let pageNumber: number | string | undefined = undefined;
    const rawPage = raw.page_number ?? raw.pageNumber ?? raw.page ?? raw.pages ?? raw.page_no ?? raw.page_num;
    if (typeof rawPage === 'number' && Number.isInteger(rawPage)) {
      pageNumber = rawPage;
    } else if (typeof rawPage === 'string' && rawPage.trim()) {
      pageNumber = rawPage.trim();
    }

    // Extract quote / snippet text
    const quoteText =
      cleanStr(raw.quote) ||
      cleanStr(raw.quote_preview) ||
      cleanStr(raw.source_text) ||
      cleanStr(raw.evidence_text) ||
      cleanStr(raw.text) ||
      cleanStr(raw.content) ||
      cleanStr(raw.snippet) ||
      cleanStr(raw.excerpt) ||
      cleanStr(raw.matched_text);

    // Build normalized citation object
    const citation: Citation = {
      evidence_id: evidenceIdStr,
      document_id:
        cleanStr(raw.document_id) ||
        cleanStr(raw.documentId) ||
        cleanStr(raw.doc_id) ||
        cleanStr(raw.docId) ||
        cleanStr(raw.source_id),
      document_title:
        cleanStr(raw.document_title) ||
        cleanStr(raw.documentTitle) ||
        cleanStr(raw.title) ||
        cleanStr(raw.doc_title) ||
        cleanStr(raw.docTitle) ||
        cleanStr(raw.source_title) ||
        cleanStr(raw.source_name) ||
        cleanStr(raw.name),
      organization:
        cleanStr(raw.organization) ||
        cleanStr(raw.org) ||
        cleanStr(raw.publisher) ||
        cleanStr(raw.issuer) ||
        cleanStr(raw.issuing_organization) ||
        cleanStr(raw.author) ||
        cleanStr(raw.author_organization),
      publication_year: publicationYear,
      document_type:
        cleanStr(raw.document_type) ||
        cleanStr(raw.documentType) ||
        cleanStr(raw.doc_type) ||
        cleanStr(raw.type),
      source_group:
        cleanStr(raw.source_group) ||
        cleanStr(raw.sourceGroup) ||
        cleanStr(raw.group),
      source_category:
        cleanStr(raw.source_category) ||
        cleanStr(raw.sourceCategory) ||
        cleanStr(raw.category),
      source_category_name:
        cleanStr(raw.source_category_name) ||
        cleanStr(raw.sourceCategoryName) ||
        cleanStr(raw.category_name),
      source_geographic_scope:
        cleanStr(raw.source_geographic_scope) ||
        cleanStr(raw.sourceGeographicScope) ||
        cleanStr(raw.geographic_scope),
      page_number: pageNumber,
      section_id:
        cleanStr(raw.section_id) ||
        cleanStr(raw.sectionId) ||
        cleanStr(raw.section) ||
        cleanStr(raw.chapter),
      breadcrumb:
        cleanStr(raw.breadcrumb) ||
        cleanStr(raw.breadcrumbs) ||
        cleanStr(raw.path) ||
        cleanStr(raw.heading_path),
      source_unit_id:
        cleanStr(raw.source_unit_id) ||
        cleanStr(raw.sourceUnitId) ||
        cleanStr(raw.unit_id) ||
        cleanStr(raw.unitId),
      source_unit_type:
        cleanStr(raw.source_unit_type) ||
        cleanStr(raw.sourceUnitType) ||
        cleanStr(raw.unit_type),
      matched_unit_type:
        cleanStr(raw.matched_unit_type) ||
        cleanStr(raw.matchedUnitType),
      quote: quoteText,
      quote_preview: cleanStr(raw.quote_preview) || quoteText,
      source_text: cleanStr(raw.source_text) || quoteText,
      evidence_text: cleanStr(raw.evidence_text) || quoteText,
      retrieval_rank:
        typeof raw.retrieval_rank === 'number'
          ? raw.retrieval_rank
          : typeof raw.rank === 'number'
          ? raw.rank
          : undefined,
      retrieval_score:
        typeof raw.retrieval_score === 'number'
          ? raw.retrieval_score
          : typeof raw.score === 'number'
          ? raw.score
          : undefined,
      url:
        cleanStr(raw.url) ||
        cleanStr(raw.source_url) ||
        cleanStr(raw.doc_url) ||
        cleanStr(raw.link) ||
        cleanStr(raw.pdf_url),
    };

    normalized.push(citation);
  });

  return normalized;
}

/**
 * Extracts numeric string/number from evidence ID:
 * "E1" -> 1, "E12" -> 12, "1" -> 1
 */
export function getEvidenceNumber(evidenceId: string): number | string {
  if (!evidenceId) return '';
  const match = String(evidenceId).trim().match(/^E?(\d+)$/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return evidenceId;
}

/**
 * Superscript number mapping helper
 */
export function toSuperscript(num: number | string): string {
  const superscripts: Record<string, string> = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
  };
  return String(num)
    .split('')
    .map((ch) => superscripts[ch] || ch)
    .join('');
}

export interface CitationToken {
  type: 'text' | 'citation';
  value: string;
  evidenceId?: string;
  evidenceNum?: number | string;
  citation?: Citation;
}

/**
 * Tokenize a text string containing [E1], [E2], [E1, E2] patterns.
 * Deterministically maps each evidence ID (e.g. E1 -> citation with evidence_id === 'E1').
 * Never maps by array index. If an ID is missing, renders safely without crashing.
 */
export function tokenizeCitations(
  text: string,
  citations: Citation[] = []
): CitationToken[] {
  if (!text) return [];

  // Build lookup map for deterministic matching
  const citationMap = new Map<string, Citation>();
  citations.forEach((c) => {
    if (!c.evidence_id) return;
    const cleanId = c.evidence_id.toUpperCase().trim();
    citationMap.set(cleanId, c);

    // Also index without 'E' prefix (e.g. "1" for "E1")
    const numOnly = cleanId.replace(/^E/i, '');
    if (numOnly && numOnly !== cleanId) {
      citationMap.set(numOnly, c);
    }
  });

  const tokens: CitationToken[] = [];
  // Matches [E1], [E2], [e1], [E1, E2], [E1; E2; E3], [E1,E2]
  const regex = /\[(E\d+(?:\s*[,;]\s*E\d+)*)\]/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // 1. Push preceding plain text
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        value: text.substring(lastIndex, match.index),
      });
    }

    const fullMatch = match[0]; // e.g. "[E1, E2]"
    const innerContent = match[1]; // e.g. "E1, E2"

    // Split compound citations inside brackets
    const rawIds = innerContent
      .split(/[,;]/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (rawIds.length === 0) {
      tokens.push({
        type: 'text',
        value: fullMatch,
      });
    } else {
      rawIds.forEach((rawId) => {
        const upperId = rawId.toUpperCase();
        const numOnly = upperId.replace(/^E/i, '');
        const citation = citationMap.get(upperId) || citationMap.get(numOnly);

        if (citation) {
          tokens.push({
            type: 'citation',
            value: `[${upperId}]`,
            evidenceId: citation.evidence_id,
            evidenceNum: getEvidenceNumber(citation.evidence_id),
            citation,
          });
        } else {
          // If evidence ID doesn't exist in metadata, render fallback safely without fake mapping
          tokens.push({
            type: 'text',
            value: `[${rawId}]`,
          });
        }
      });
    }

    lastIndex = regex.lastIndex;
  }

  // 2. Push remainder text
  if (lastIndex < text.length) {
    tokens.push({
      type: 'text',
      value: text.substring(lastIndex),
    });
  }

  return tokens;
}

/**
 * Clean answer text for copying to clipboard (converts [E1] to [1], [E1, E2] to [1, 2])
 */
export function formatAnswerForCopy(text: string): string {
  if (!text) return '';
  return text.replace(/\[(E\d+(?:\s*[,;]\s*E\d+)*)\]/gi, (_, inner: string) => {
    const formatted = inner.replace(/E(\d+)/gi, '$1');
    return `[${formatted}]`;
  });
}

