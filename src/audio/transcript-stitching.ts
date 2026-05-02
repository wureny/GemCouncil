export interface TranscriptChunk {
  index: number;
  transcript?: string;
  error?: string;
}

export function stitchChunkTranscripts(chunks: TranscriptChunk[]): string {
  const sortedChunks = [...chunks].sort((first, second) => first.index - second.index);
  const words: string[] = [];

  for (const chunk of sortedChunks) {
    if (chunk.error !== undefined) {
      throw new Error(`Cannot stitch failed chunk ${chunk.index}: ${chunk.error}`);
    }

    const chunkWords = normalizeWhitespace(chunk.transcript ?? "").split(" ").filter(Boolean);
    const overlapLength = findWordOverlap(words, chunkWords);
    words.push(...chunkWords.slice(overlapLength));
  }

  return words.join(" ");
}

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function findWordOverlap(previousWords: string[], nextWords: string[]): number {
  const maxOverlap = Math.min(previousWords.length, nextWords.length);

  for (let length = maxOverlap; length > 0; length -= 1) {
    const previousSuffix = previousWords.slice(previousWords.length - length).map(normalizeWord);
    const nextPrefix = nextWords.slice(0, length).map(normalizeWord);

    if (previousSuffix.every((word, index) => word === nextPrefix[index])) {
      return length;
    }
  }

  return 0;
}

function normalizeWord(word: string): string {
  return word.toLocaleLowerCase();
}
