import type { Citation } from '../types/chat';

/**
 * Extracts number from evidence ID like "E1" -> 1, "E12" -> 12
 */
export function getEvidenceNumber(evidenceId: string): number | string {
  const match = evidenceId.match(/^E(\d+)$/i);
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
 * Tokenize a text string containing [E1], [E2] patterns.
 * Only tags that exist in citations will have citation metadata.
 */
export function tokenizeCitations(
  text: string,
  citations: Citation[] = []
): CitationToken[] {
  if (!text) return [];

  const citationMap = new Map<string, Citation>();
  citations.forEach((c) => {
    citationMap.set(c.evidence_id.toUpperCase(), c);
  });

  const tokens: CitationToken[] = [];
  const regex = /\[(E\d+)\]/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    // Push preceding plain text
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        value: text.substring(lastIndex, match.index),
      });
    }

    const rawTag = match[0]; // e.g. "[E1]"
    const evidenceId = match[1].toUpperCase(); // e.g. "E1"
    const citation = citationMap.get(evidenceId);

    if (citation) {
      tokens.push({
        type: 'citation',
        value: rawTag,
        evidenceId,
        evidenceNum: getEvidenceNumber(evidenceId),
        citation,
      });
    } else {
      // If evidence ID doesn't exist in citations, render as normal text to prevent crash
      tokens.push({
        type: 'text',
        value: rawTag,
      });
    }

    lastIndex = regex.lastIndex;
  }

  // Push remainder text
  if (lastIndex < text.length) {
    tokens.push({
      type: 'text',
      value: text.substring(lastIndex),
    });
  }

  return tokens;
}

/**
 * Clean answer text for copying to clipboard (converts [E1] to [1])
 */
export function formatAnswerForCopy(text: string): string {
  if (!text) return '';
  return text.replace(/\[E(\d+)\]/gi, '[$1]');
}
