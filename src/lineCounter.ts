const BINARY_SAMPLE_BYTES = 8192;

export function countTextLines(content: Uint8Array): number | undefined {
    if (isLikelyBinary(content)) {
        return undefined;
    }

    if (content.length === 0) {
        return 0;
    }

    let newlineCount = 0;
    for (const byte of content) {
        if (byte === 0x0a) {
            newlineCount++;
        }
    }

    return content[content.length - 1] === 0x0a ? newlineCount : newlineCount + 1;
}

export function shouldCountLines(fileSizeBytes: number, maxLineCountBytes: number): boolean {
    return maxLineCountBytes > 0 && fileSizeBytes <= maxLineCountBytes;
}

function isLikelyBinary(content: Uint8Array): boolean {
    const sampleLength = Math.min(content.length, BINARY_SAMPLE_BYTES);
    for (let i = 0; i < sampleLength; i++) {
        if (content[i] === 0) {
            return true;
        }
    }

    return false;
}
