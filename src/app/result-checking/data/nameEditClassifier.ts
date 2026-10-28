// Deterministic classifier for self-service name corrections — no model
// call, no judgment call, same logic runs client-side (for instant
// preview) and server-side (the actual enforcement before any write).
// Framework-agnostic on purpose: plain TS, safe to import from a 'use
// client' component or a Route Handler.

export type NameEditClassification =
    | 'identical'    // nothing to change
    | 'reorder'      // same words, different order — any word count
    | 'typo'         // small edit distance, same word count
    | 'completion'   // each word is unchanged or extended (e.g. "F." -> "FIONA")
    | 'unsupported'; // a real identity change — needs human review

/** Simple name editing is one of reorder/typo/completion. */
export function isSimpleNameEdit(classification: NameEditClassification): boolean {
    return classification === 'reorder' || classification === 'typo' || classification === 'completion';
}

function normalize(name: string): string {
    return name.trim().toUpperCase().replace(/\s+/g, ' ');
}

/** Words, trailing periods stripped (so "F." lines up with "FIONA" for the completion check) and empties dropped. */
function toWords(name: string): string[] {
    return normalize(name).split(' ').map((w) => w.replace(/\.+$/, '')).filter(Boolean);
}

/** Standard Levenshtein edit distance. */
function levenshtein(a: string, b: string): number {
    const m = a.length;
    const n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    const prev = new Array(n + 1);
    const curr = new Array(n + 1);
    for (let j = 0; j <= n; j++) prev[j] = j;
    for (let i = 1; i <= m; i++) {
        curr[0] = i;
        for (let j = 1; j <= n; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            curr[j] = Math.min(
                prev[j] + 1,      // deletion
                curr[j - 1] + 1,  // insertion
                prev[j - 1] + cost, // substitution
            );
        }
        for (let j = 0; j <= n; j++) prev[j] = curr[j];
    }
    return prev[n];
}

export function classifyNameEdit(currentName: string, proposedName: string): NameEditClassification {
    const current = normalize(currentName);
    const proposed = normalize(proposedName);
    if (!proposed || current === proposed) return 'identical';

    const currentWords = toWords(currentName);
    const proposedWords = toWords(proposedName);

    // Reorder — same multiset of words, any order, any word count (handles
    // "OBI COLLINS CHIDI" -> "CHIDI OBI COLLINS" the same as a 2-word swap).
    if (currentWords.length === proposedWords.length) {
        const a = [...currentWords].sort();
        const b = [...proposedWords].sort();
        if (a.every((w, i) => w === b[i])) return 'reorder';
    }

    // Completion — same position, each current word is unchanged or a
    // prefix of the proposed word ("F." -> "FIONA", "AKU" -> "AKUCHUKWU").
    if (currentWords.length === proposedWords.length) {
        const isCompletion = currentWords.every((w, i) => proposedWords[i].startsWith(w));
        if (isCompletion) return 'completion';
    }

    // Typo — small edit distance relative to length, same word count (so a
    // genuinely different name of similar length doesn't slip through).
    if (currentWords.length === proposedWords.length) {
        const distance = levenshtein(current, proposed);
        const threshold = Math.max(3, Math.ceil(Math.max(current.length, proposed.length) * 0.2));
        if (distance <= threshold) return 'typo';
    }

    return 'unsupported';
}
